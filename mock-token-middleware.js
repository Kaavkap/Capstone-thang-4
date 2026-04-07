const DEV_TOKEN = "dev_token_cinema_2026";

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const openPaths = ["/"];
  if (openPaths.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const expected = `Bearer ${DEV_TOKEN}`;

  if (authHeader !== expected) {
    return res.status(401).json({
      message: "Unauthorized: token khong hop le.",
      expected_format: "Authorization: Bearer <TOKEN>"
    });
  }

  return next();
};
