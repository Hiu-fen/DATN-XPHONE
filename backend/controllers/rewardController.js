const Order = require("../models/orderModel");
const User = require("../models/userModels");

exports.getRewardLeaderboard = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: { $regex: "Đã nhận hàng", $options: "i" } // không phân biệt hoa/thường
        }
      },
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: 1 },
        }
      },
      {
  $lookup: {
    from: "users",
    let: { userIdStr: "$_id" },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: [{ $toString: "$_id" }, "$$userIdStr"]
          }
        }
      }
    ],
    as: "userInfo"
  }
  
},

      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalPoints: 1,
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    res.json(result);
  } catch (error) {
    console.error("❌ Lỗi khi lấy reward:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
