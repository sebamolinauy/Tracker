module.exports = {
    apps: [{
        name: 'tracker',
        script: './src/api/application/index.js',
        node_args: ['--env-file=variables/api.production.env', '--max-old-space-size=256', '--expose-gc'],
        args: ['production'],
        watch: ['src/api', 'variables'],
        watch_delay: 1000,
    }],
};
