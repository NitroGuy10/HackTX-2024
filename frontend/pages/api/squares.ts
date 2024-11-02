import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const greenList: number[] = [1, 2, 3]; // Example IDs for green squares
  const redList: number[] = [4, 5, 6];    // Example IDs for red squares

  res.status(200).json({ greenList, redList });
}
