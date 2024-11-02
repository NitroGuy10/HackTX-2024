import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const greenList = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]; // 13 green squares
  const redList = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]; // 12 red squares

  res.status(200).json({ greenList, redList });
}
