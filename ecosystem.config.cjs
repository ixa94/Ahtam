module.exports = {
  apps: [
    {
      name: "akhtam",
      cwd: "/var/www/akhtam",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "127.0.0.1",
        PORT: "3000",
      },
      max_memory_restart: "450M",
      restart_delay: 3000,
      time: true,
    },
  ],
};
