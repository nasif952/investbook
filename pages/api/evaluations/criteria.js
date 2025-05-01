import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import EvaluationCriteria from '../../../lib/models/EvaluationCriteria';

export default async function handler(req, res) {
  // Allow unauthenticated access for now, or add session check if needed
  // const session = await getServerSession(req, res, authOptions);
  // if (!session) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }

  await connectDB();

  if (req.method === 'GET') {
    try {
      // Find only active criteria, sort by order or name
      const criteria = await EvaluationCriteria.find({ active: true }).sort({ order: 1, name: 1 }); 
      res.status(200).json(criteria);
    } catch (error) {
      console.error('Get Evaluation Criteria API Error:', error);
      res.status(500).json({ message: 'Server Error fetching evaluation criteria' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 