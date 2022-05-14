// Copied from https://github.com/nodejs/node/blob/v17.0.1/lib/internal/modules/cjs/loader.js

'use strict';

const {
  ArrayIsArray,
  ArrayPrototypeConcat,
  ArrayPrototypeFilter,
  ArrayPrototypeIncludes,
  ArrayPrototypeIndexOf,
  ArrayPrototypeJoin,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSplice,
  ArrayPrototypeUnshift,
  ArrayPrototypeUnshiftApply,
  Boolean,
  Error,
  JSONParse,
  ObjectCreate,
  ObjectDefineProperty,
  ObjectFreeze,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetPrototypeOf,
  ObjectKeys,
  ObjectPrototype,
  ObjectPrototypeHasOwnProperty,
  ObjectSetPrototypeOf,
  Proxy,
  ReflectApply,
  ReflectSet,
  RegExpPrototypeExec,
  RegExpPrototypeTest,
  SafeMap,
  SafeWeakMap,
  String,
  StringPrototypeCharAt,
  StringPrototypeCharCodeAt,
  StringPrototypeEndsWith,
  StringPrototypeLastIndexOf,
  StringPrototypeIndexOf,
  StringPrototypeMatch,
  StringPrototypeRepeat,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
} = primordials;

const { NativeModule } = require('internal/bootstrap/loaders');
const { pathToFileURL, fileURLToPath, isURLInstance } = require('internal/url');
const fs = require('fs');
const internalFS = require('internal/fs/utils');
const path = require('path');
const { sep } = path;
const { internalModuleStat } = internalBinding('fs');
const packageJsonReader = require('internal/modules/package_json_reader');
const {
  cjsConditions,
  hasEsmSyntax,
} = require('internal/modules/cjs/helpers');
const { getOptionValue } = require('internal/options');
const preserveSymlinks = getOptionValue('--preserve-symlinks');
const preserveSymlinksMain = getOptionValue('--preserve-symlinks-main');
// Do not eagerly grab .manifest, it may be in TDZ
const policy = getOptionValue('--experimental-policy') ?
  require('internal/process/policy') :
  null;

const {
  codes: {
    ERR_INVALID_MODULE_SPECIFIER,
    ERR_REQUIRE_ESM,
  },
} = require('internal/errors');

const {
  CHAR_FORWARD_SLASH,
} = require('internal/constants');

const {
  encodedSepRegEx,
  packageExportsResolve,
  packageImportsResolve
} = require('internal/modules/esm/resolve');

const isWindows = process.platform === 'win32';

const relativeResolveCache = ObjectCreate(null);

let requireDepth = 0;
let statCache = null;
let isPreloading = false;

function stat(filename) {
  filename = path.toNamespacedPath(filename);
  if (statCache !== null) {
    const result = statCache.get(filename);
    if (result !== undefined) return result;
  }
  const result = internalModuleStat(filename);
  if (statCache !== null && result >= 0) {
    // Only set cache when `internalModuleStat(filename)` succeeds.
    statCache.set(filename, result);
  }
  return result;
}


// Given a module name, and a list of paths to test, returns the first
// matching file in the following precedence.
//
// require("a.<ext>")
//   -> a.<ext>
//
// require("a")
//   -> a
//   -> a.<ext>
//   -> a/index.<ext>

const packageJsonCache = new SafeMap();

function readPackage(requestPath) {
  const jsonPath = path.resolve(requestPath, 'package.json');

  const existing = packageJsonCache.get(jsonPath);
  if (existing !== undefined) return existing;

  const result = packageJsonReader.read(jsonPath);
  const json = result.containsKeys === false ? '{}' : result.string;
  if (json === undefined) {
    packageJsonCache.set(jsonPath, false);
    return false;
  }

  try {
    const parsed = JSONParse(json);
    const filtered = {
      name: parsed.name,
      main: parsed.main,
      exports: parsed.exports,
      imports: parsed.imports,
      type: parsed.type
    };
    packageJsonCache.set(jsonPath, filtered);
    return filtered;
  } catch (e) {
    e.path = jsonPath;
    e.message = 'Error parsing ' + jsonPath + ': ' + e.message;
    throw e;
  }
}

function readPackageScope(checkPath) {
  const rootSeparatorIndex = StringPrototypeIndexOf(checkPath, sep);
  let separatorIndex;
  do {
    separatorIndex = StringPrototypeLastIndexOf(checkPath, sep);
    checkPath = StringPrototypeSlice(checkPath, 0, separatorIndex);
    if (StringPrototypeEndsWith(checkPath, sep + 'node_modules'))
      return false;
    const pjson = readPackage(checkPath + sep);
    if (pjson) return {
      data: pjson,
      path: checkPath,
    };
  } while (separatorIndex > rootSeparatorIndex);
  return false;
}

function tryPackage(requestPath, exts, isMain, originalPath) {
  const pkg = readPackage(requestPath)?.main;

  if (!pkg) {
    return tryExtensions(path.resolve(requestPath, 'index'), exts, isMain);
  }

  const filename = path.resolve(requestPath, pkg);
  let actual = tryFile(filename, isMain) ||
    tryExtensions(filename, exts, isMain) ||
    tryExtensions(path.resolve(filename, 'index'), exts, isMain);
  if (actual === false) {
    actual = tryExtensions(path.resolve(requestPath, 'index'), exts, isMain);
    if (!actual) {
      // eslint-disable-next-line no-restricted-syntax
      const err = new Error(
        `Cannot find module '${filename}'. ` +
        'Please verify that the package.json has a valid "main" entry'
      );
      err.code = 'MODULE_NOT_FOUND';
      err.path = path.resolve(requestPath, 'package.json');
      err.requestPath = originalPath;
      // TODO(BridgeAR): Add the requireStack as well.
      throw err;
    } else {
      const jsonPath = path.resolve(requestPath, 'package.json');
      process.emitWarning(
        `Invalid 'main' field in '${jsonPath}' of '${pkg}'. ` +
          'Please either fix that or report it to the module author',
        'DeprecationWarning',
        'DEP0128'
      );
    }
  }
  return actual;
}

// In order to minimize unnecessary lstat() calls,
// this cache is a list of known-real paths.
// Set to an empty Map to reset.
const realpathCache = new SafeMap();

// Check if the file exists and is not a directory
// if using --preserve-symlinks and isMain is false,
// keep symlinks intact, otherwise resolve to the
// absolute realpath.
function tryFile(requestPath, isMain) {
  const rc = stat(requestPath);
  if (rc !== 0) return;
  if (preserveSymlinks && !isMain) {
    return path.resolve(requestPath);
  }
  return toRealPath(requestPath);
}

function toRealPath(requestPath) {
  return fs.realpathSync(requestPath, {
    [internalFS.realpathCacheKey]: realpathCache
  });
}

// Given a path, check if the file exists with any of the set extensions
function tryExtensions(p, exts, isMain) {
  for (let i = 0; i < exts.length; i++) {
    const filename = tryFile(p + exts[i], isMain);

    if (filename) {
      return filename;
    }
  }
  return false;
}

// This only applies to requests of a specific form:
// 1. name/.*
// 2. @scope/name/.*
const EXPORTS_PATTERN = /^((?:@[^/\\%]+\/)?[^./\\%][^/\\%]*)(\/.*)?$/;
function resolveExports(nmPath, request) {
  // The implementation's behavior is meant to mirror resolution in ESM.
  const { 1: name, 2: expansion = '' } =
    StringPrototypeMatch(request, EXPORTS_PATTERN) || [];
  if (!name)
    return;
  const pkgPath = path.resolve(nmPath, name);
  const pkg = readPackage(pkgPath);
  if (pkg?.exports != null) {
    try {
      return finalizeEsmResolution(packageExportsResolve(
        pathToFileURL(pkgPath + '/package.json'), '.' + expansion, pkg, null,
        cjsConditions), null, pkgPath);
    } catch (e) {
      if (e.code === 'ERR_MODULE_NOT_FOUND')
        throw createEsmNotFoundErr(request, pkgPath + '/package.json');
      throw e;
    }
  }
}

const trailingSlashRegex = /(?:^|\/)\.?\.$/;
Module._findPath = function(request, paths, isMain) {
  const absoluteRequest = path.isAbsolute(request);
  if (absoluteRequest) {
    paths = [''];
  } else if (!paths || paths.length === 0) {
    return false;
  }

  const cacheKey = request + '\x00' + ArrayPrototypeJoin(paths, '\x00');
  const entry = Module._pathCache[cacheKey];
  if (entry)
    return entry;

  let exts;
  let trailingSlash = request.length > 0 &&
    StringPrototypeCharCodeAt(request, request.length - 1) ===
    CHAR_FORWARD_SLASH;
  if (!trailingSlash) {
    trailingSlash = RegExpPrototypeTest(trailingSlashRegex, request);
  }

  // For each path
  for (let i = 0; i < paths.length; i++) {
    // Don't search further if path doesn't exist
    const curPath = paths[i];
    if (curPath && stat(curPath) < 1) continue;

    if (!absoluteRequest) {
      const exportsResolved = resolveExports(curPath, request);
      if (exportsResolved)
        return exportsResolved;
    }

    const basePath = path.resolve(curPath, request);
    let filename;

    const rc = stat(basePath);
    if (!trailingSlash) {
      if (rc === 0) {  // File.
        if (!isMain) {
          if (preserveSymlinks) {
            filename = path.resolve(basePath);
          } else {
            filename = toRealPath(basePath);
          }
        } else if (preserveSymlinksMain) {
          // For the main module, we use the preserveSymlinksMain flag instead
          // mainly for backward compatibility, as the preserveSymlinks flag
          // historically has not applied to the main module.  Most likely this
          // was intended to keep .bin/ binaries working, as following those
          // symlinks is usually required for the imports in the corresponding
          // files to resolve; that said, in some use cases following symlinks
          // causes bigger problems which is why the preserveSymlinksMain option
          // is needed.
          filename = path.resolve(basePath);
        } else {
          filename = toRealPath(basePath);
        }
      }

      if (!filename) {
        // Try it with each of the extensions
        if (exts === undefined)
          exts = ObjectKeys(Module._extensions);
        filename = tryExtensions(basePath, exts, isMain);
      }
    }

    if (!filename && rc === 1) {  // Directory.
      // try it with each of the extensions at "index"
      if (exts === undefined)
        exts = ObjectKeys(Module._extensions);
      filename = tryPackage(basePath, exts, isMain, request);
    }

    if (filename) {
      Module._pathCache[cacheKey] = filename;
      return filename;
    }
  }

  return false;
};

function finalizeEsmResolution(resolved, parentPath, pkgPath) {
  if (RegExpPrototypeTest(encodedSepRegEx, resolved))
    throw new ERR_INVALID_MODULE_SPECIFIER(
      resolved, 'must not include encoded "/" or "\\" characters', parentPath);
  const filename = fileURLToPath(resolved);
  const actual = tryFile(filename);
  if (actual)
    return actual;
  const err = createEsmNotFoundErr(filename,
                                   path.resolve(pkgPath, 'package.json'));
  throw err;
}

function createEsmNotFoundErr(request, path) {
  // eslint-disable-next-line no-restricted-syntax
  const err = new Error(`Cannot find module '${request}'`);
  err.code = 'MODULE_NOT_FOUND';
  if (path)
    err.path = path;
  // TODO(BridgeAR): Add the requireStack as well.
  return err;
}

// Native extension for .js
Module._extensions['.js'] = function(module, filename) {
  // If already analyzed the source, then it will be cached.
  const cached = cjsParseCache.get(module);
  let content;
  if (cached?.source) {
    content = cached.source;
    cached.source = undefined;
  } else {
    content = fs.readFileSync(filename, 'utf8');
  }
  if (StringPrototypeEndsWith(filename, '.js')) {
    const pkg = readPackageScope(filename);
    // Function require shouldn't be used in ES modules.
    if (pkg?.data?.type === 'module') {
      const parent = moduleParentCache.get(module);
      const parentPath = parent?.filename;
      const packageJsonPath = path.resolve(pkg.path, 'package.json');
      const usesEsm = hasEsmSyntax(content);
      const err = new ERR_REQUIRE_ESM(filename, usesEsm, parentPath,
                                      packageJsonPath);
      // Attempt to reconstruct the parent require frame.
      if (Module._cache[parentPath]) {
        let parentSource;
        try {
          parentSource = fs.readFileSync(parentPath, 'utf8');
        } catch {}
        if (parentSource) {
          const errLine = StringPrototypeSplit(
            StringPrototypeSlice(err.stack, StringPrototypeIndexOf(
              err.stack, '    at ')), '\n', 1)[0];
          const { 1: line, 2: col } =
              RegExpPrototypeExec(/(\d+):(\d+)\)/, errLine) || [];
          if (line && col) {
            const srcLine = StringPrototypeSplit(parentSource, '\n')[line - 1];
            const frame = `${parentPath}:${line}\n${srcLine}\n${
              StringPrototypeRepeat(' ', col - 1)}^\n`;
            setArrowMessage(err, frame);
          }
        }
      }
      throw err;
    }
  }
  module._compile(content, filename);
};