export default function handler(req, res) {
  res.status(200).json([
    { user: "asep", password: "asep123" },
    { user: "agus", password: "agustampan" }
  ]);
}
