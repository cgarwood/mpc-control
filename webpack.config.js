var path = require("path")

module.exports = {
  // This is the "main" file which should include all other modules
  entry: './src/main.js',
  // Where should the compiled file go?
  output: {
    // To the `dist` folder
    path: path.join(__dirname, 'dist'),
    // With the filename `build.js` so it's dist/build.js
    filename: 'build.js'
  },
  resolve: {
	  alias: {
		vue: 'vue/dist/vue.js'  
	  }
  },
  module: {
    // Special compilation rules
    loaders: [
      {
        // Ask webpack to check: If this file ends with .js, then apply some transforms
        test: /\.js$/,
        // Transform it with babel
        loader: 'babel',
        // don't transform node_modules folder (which don't need to be compiled)
        exclude: /node_modules/
      },
	  {
        test: /\.vue$/,
        loader: 'vue'
      },
	  { test: /\.(?:jpg|gif|png)$/, loader: 'file'}
    ]
  },
  vue: {
    loaders: {
      js: 'babel'
    }
  }
}