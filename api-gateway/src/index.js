const express = require("express");
const http = require("http");

const app = express();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "api-gateway" });
});

app.get("/", (req, res) => {
  res.json({
    message: "API Gateway is working!",
    services: ["/todos", "/users"],
  });
});

// Manual proxy function
function proxyRequest(serviceHost, servicePort) {
  return (req, res) => {
    const path = req.url;
    const method = req.method;

    const options = {
      hostname: serviceHost,
      port: servicePort,
      path: path,
      method: method,
      headers: {
        ...req.headers,
        host: serviceHost,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error(`Proxy error to ${serviceHost}:`, err.message);
      if (!res.headersSent) {
        res.status(503).json({ error: "Service unavailable" });
      }
    });

    req.pipe(proxyReq);
  };
}

// Proxy routes
app.use(
  "/todos",
  (req, res, next) => {
    req.url = req.url.replace(/^\/todos/, "");
    if (!req.url) req.url = "/";
    next();
  },
  proxyRequest("todo-service.todo-app.svc.cluster.local", 3001)
);

app.use(
  "/users",
  (req, res, next) => {
    req.url = req.url.replace(/^\/users/, "");
    if (!req.url) req.url = "/";
    next();
  },
  proxyRequest("user-service.todo-app.svc.cluster.local", 3002)
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
