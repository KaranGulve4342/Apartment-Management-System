const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "karan4342",
  database: process.env.DB_DATABASE || "dbms_project",
  insecureAuth: true,
};

module.exports = config;
