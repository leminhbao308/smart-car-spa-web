module.exports = {
  apps: [
    {
      name: "smart-car-spa-web",
      script: "npm",
      args: "run dev:ec2",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Tự động restart khi có lỗi
      min_uptime: "10s",
      max_restarts: 10,
      // Kill timeout để đảm bảo process được kill đúng cách
      kill_timeout: 5000,
    },
  ],
};

