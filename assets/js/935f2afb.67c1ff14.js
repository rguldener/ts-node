"use strict";(self.webpackChunk_ts_node_website=self.webpackChunk_ts_node_website||[]).push([[53],{1109:function(e){e.exports=JSON.parse('{"pluginId":"default","version":"current","label":"Next","banner":null,"badge":false,"className":"docs-version-current","isLast":true,"docsSidebars":{"primarySidebar":[{"type":"category","label":"General","collapsed":false,"items":[{"type":"link","label":"Overview","href":"/ts-node/docs/","docId":"overview"},{"type":"link","label":"Installation","href":"/ts-node/docs/installation","docId":"installation"},{"type":"link","label":"Usage","href":"/ts-node/docs/usage","docId":"usage"},{"type":"link","label":"Configuration","href":"/ts-node/docs/configuration","docId":"configuration"},{"type":"link","label":"Options","href":"/ts-node/docs/options","docId":"options"},{"type":"link","label":"SWC","href":"/ts-node/docs/swc","docId":"swc"},{"type":"link","label":"CommonJS vs native ECMAScript modules","href":"/ts-node/docs/imports","docId":"commonjs-vs-native-ecmascript-modules"},{"type":"link","label":"Troubleshooting","href":"/ts-node/docs/troubleshooting","docId":"troubleshooting"},{"type":"link","label":"Performance","href":"/ts-node/docs/performance","docId":"performance"}],"collapsible":true},{"type":"category","label":"Advanced","collapsed":false,"items":[{"type":"link","label":"How it works","href":"/ts-node/docs/how-it-works","docId":"how-it-works"},{"type":"link","label":"Ignored files","href":"/ts-node/docs/scope","docId":"scope"},{"type":"link","label":"paths and baseUrl\\n","href":"/ts-node/docs/paths","docId":"paths"},{"type":"link","label":"Third-party compilers","href":"/ts-node/docs/compilers","docId":"compilers"},{"type":"link","label":"Transpilers","href":"/ts-node/docs/transpilers","docId":"transpilers"},{"type":"link","label":"Module type overrides","href":"/ts-node/docs/module-type-overrides","docId":"module-type-overrides"},{"type":"link","label":"API","href":"/ts-node/docs/api","docId":"api"}],"collapsible":true},{"type":"category","label":"Recipes","collapsed":false,"items":[{"type":"link","label":"Watching and restarting","href":"/ts-node/docs/recipes/watching-and-restarting","docId":"recipes/watching-and-restarting"},{"type":"link","label":"AVA","href":"/ts-node/docs/recipes/ava","docId":"recipes/ava"},{"type":"link","label":"Gulp","href":"/ts-node/docs/recipes/gulp","docId":"recipes/gulp"},{"type":"link","label":"IntelliJ and Webstorm","href":"/ts-node/docs/recipes/intellij","docId":"recipes/intellij"},{"type":"link","label":"Mocha","href":"/ts-node/docs/recipes/mocha","docId":"recipes/mocha"},{"type":"link","label":"Tape","href":"/ts-node/docs/recipes/tape","docId":"recipes/tape"},{"type":"link","label":"Visual Studio Code","href":"/ts-node/docs/recipes/visual-studio-code","docId":"recipes/visual-studio-code"},{"type":"link","label":"Other","href":"/ts-node/docs/recipes/other","docId":"recipes/other"}],"collapsible":true}],"hiddenSidebar":[{"type":"category","label":"Hidden pages","collapsed":false,"items":[{"type":"link","label":"Options","href":"/ts-node/docs/options-table","docId":"options-table"}],"collapsible":true}]},"docs":{"api":{"id":"api","title":"API","description":"ts-node\'s complete API is documented here: API Docs","sidebar":"primarySidebar"},"commonjs-vs-native-ecmascript-modules":{"id":"commonjs-vs-native-ecmascript-modules","title":"CommonJS vs native ECMAScript modules","description":"TypeScript is almost always written using modern import syntax, but it is also transformed before being executed by the underlying runtime.  You can choose to either transform to CommonJS or to preserve the native import syntax, using node\'s native ESM support.  Configuration is different for each.","sidebar":"primarySidebar"},"compilers":{"id":"compilers","title":"Third-party compilers","description":"Some projects require a patched typescript compiler which adds additional features.  For example, ttypescript and ts-patch","sidebar":"primarySidebar"},"configuration":{"id":"configuration","title":"Configuration","description":"ts-node supports a variety of options which can be specified via tsconfig.json, as CLI flags, as environment variables, or programmatically.","sidebar":"primarySidebar"},"how-it-works":{"id":"how-it-works","title":"How it works","description":"ts-node works by registering hooks for .ts, .tsx, .js, and/or .jsx extensions.","sidebar":"primarySidebar"},"installation":{"id":"installation","title":"Installation","description":"Tip: Installing modules locally allows you to control and share the versions through package.json. ts-node will always resolve the compiler from cwd before checking relative to its own installation.","sidebar":"primarySidebar"},"module-type-overrides":{"id":"module-type-overrides","title":"Module type overrides","description":"Wherever possible, it is recommended to use TypeScript\'s NodeNext or Node16 mode instead of the options described","sidebar":"primarySidebar"},"options":{"id":"options","title":"Options","description":"All command-line flags support both --camelCase and --hyphen-case.","sidebar":"primarySidebar"},"options-table":{"id":"options-table","title":"Options","description":"\x3c!--","sidebar":"hiddenSidebar"},"overview":{"id":"overview","title":"Overview","description":"ts-node is a TypeScript execution engine and REPL for Node.js.","sidebar":"primarySidebar"},"paths":{"id":"paths","title":"paths and baseUrl\\n","description":"You can use ts-node together with tsconfig-paths to load modules according to the paths section in tsconfig.json.","sidebar":"primarySidebar"},"performance":{"id":"performance","title":"Performance","description":"These tricks will make ts-node faster.","sidebar":"primarySidebar"},"recipes/ava":{"id":"recipes/ava","title":"AVA","description":"Assuming you are configuring AVA via your package.json, add one of the following configurations.","sidebar":"primarySidebar"},"recipes/gulp":{"id":"recipes/gulp","title":"Gulp","description":"ts-node support is built-in to gulp.","sidebar":"primarySidebar"},"recipes/intellij":{"id":"recipes/intellij","title":"IntelliJ and Webstorm","description":"Create a new Node.js configuration and add -r ts-node/register to \\"Node parameters.\\"","sidebar":"primarySidebar"},"recipes/mocha":{"id":"recipes/mocha","title":"Mocha","description":"Mocha 7 and newer","sidebar":"primarySidebar"},"recipes/npx-and-yarn-dlx":{"id":"recipes/npx-and-yarn-dlx","title":"npx and yarn dlx","description":"Using npx or yarn dlx is a great ways to publish reusable TypeScript tools to GitHub without precompiling or packaging."},"recipes/other":{"id":"recipes/other","title":"Other","description":"In many cases, setting NODEOPTIONS will enable ts-node within other node tools, child processes, and worker threads.","sidebar":"primarySidebar"},"recipes/tape":{"id":"recipes/tape","title":"Tape","description":"","sidebar":"primarySidebar"},"recipes/visual-studio-code":{"id":"recipes/visual-studio-code","title":"Visual Studio Code","description":"Create a new Node.js debug configuration, add -r ts-node/register to node args and move the program to the args list (so VS Code doesn\'t look for outFiles).","sidebar":"primarySidebar"},"recipes/watching-and-restarting":{"id":"recipes/watching-and-restarting","title":"Watching and restarting","description":"ts-node focuses on adding first-class TypeScript support to node.  Watching files and code reloads are out of scope for the project.","sidebar":"primarySidebar"},"scope":{"id":"scope","title":"Ignored files","description":"ts-node transforms certain files and ignores others.  We refer to this mechanism as \\"scoping.\\"  There are various","sidebar":"primarySidebar"},"swc":{"id":"swc","title":"SWC","description":"SWC support is built-in via the --swc flag or \\"swc\\": true tsconfig option.","sidebar":"primarySidebar"},"transpilers":{"id":"transpilers","title":"Transpilers","description":"ts-node supports third-party transpilers as plugins.  Transpilers such as swc can transform TypeScript into JavaScript","sidebar":"primarySidebar"},"troubleshooting":{"id":"troubleshooting","title":"Troubleshooting","description":"Configuration","sidebar":"primarySidebar"},"types":{"id":"types","title":"types","description":""},"usage":{"id":"usage","title":"Usage","description":"Command Line","sidebar":"primarySidebar"}}}')}}]);