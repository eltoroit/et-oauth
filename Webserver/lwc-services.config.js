// Find the full example of all available configuration options at
// https://github.com/muenzpraeger/create-lwc-app/blob/main/packages/lwc-services/example/lwc-services.config.js
module.exports = {
    mode: 'production',
    resources: [
        { from: 'src/client/resources/', to: 'dist/resources/' },
        // { from: 'node_modules/@salesforce-ux/design-system/assets', to: 'src/SLDS' },
        { from: 'node_modules/@salesforce-ux/design-system/assets', to: 'dist/SLDS' },

    ],
    sourceDir: './src/client',
    lwcCompilerOutput: {
        development: {
            compat: false,
            minify: false,
            env: {
                NODE_ENV: 'production'
            }
        }
    },
};