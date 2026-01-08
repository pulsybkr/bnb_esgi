module.exports = {
    apps: [
        {
            name: 'bnb-backend',
            cwd: './back-end',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3333
            },
            restart_delay: 3000,
            max_restarts: 10
        },
        {
            name: 'bnb-frontend',
            cwd: './frontend',
            script: 'npm',
            args: 'run preview -- --port 4173 --host 0.0.0.0',
            env: {
                NODE_ENV: 'production'
            },
            restart_delay: 3000
        }
    ]
};
