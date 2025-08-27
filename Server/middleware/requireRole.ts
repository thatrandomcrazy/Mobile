import { Request, Response, NextFunction } from "express";

export const requireRole = (role: "admin" | "customer") =>
  (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden" });
    next();
  };

export const adminOnly = requireRole("admin");
