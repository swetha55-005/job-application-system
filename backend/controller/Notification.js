const NotificationModel = require("../models/Notification");


//get notification

const getNotifications = async (req, res) => {
  try {

    const { userId } = req.params;


    const notifications =
      await NotificationModel.find({
        recipient: userId,
      })
        .populate("jobId")
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({

      success: true,

      notifications,
    });

  } catch (error) {

    console.error(
      "Get Notifications Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Server error",

      error: error.message,
    });
  }
};



// MARK NOTIFICATION AS READ


const markNotificationAsRead = async (
  req,
  res
) => {
  try {

    const {
      notificationId,
    } = req.params;


    const notification =
      await NotificationModel.findById(
        notificationId
      );


    if (!notification) {

      return res.status(404).json({

        success: false,

        message:
          "Notification not found",
      });
    }


    notification.isRead = true;

    await notification.save();


    return res.status(200).json({

      success: true,

      message:
        "Notification marked as read",

      notification,
    });

  } catch (error) {

    console.error(
      "Mark Notification Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Server error",

      error: error.message,
    });
  }
};


module.exports = { getNotifications, markNotificationAsRead};