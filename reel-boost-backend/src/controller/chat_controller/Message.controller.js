const chat_service = require("../../service/repository/Chat.service");
const filterData = require("../../helper/filter.helper");
const participant_service = require("../../service/repository/Participant.service");
const message_service = require("../../service/repository/Message.service");
const message_seen_service = require("../../service/repository/Message_seen.service");
const {
  getUser
} = require("../../service/repository/user.service");
const { User, Message, Social } = require("../../../models");
const { Op, Sequelize } = require("sequelize"); // Ensure you're importing Op

async function typing(socket, data, emitEvent) {
  const isUser = await getUser({ user_id: socket.authData.user_id });
  if (!isUser) {
    return next(new Error("User not found."));
  }
  attributes = [
    "profile_pic",
    "user_id",
    "full_name",
    "user_name",
    "email",
    "country_code",
    "country",
    "gender",
    "bio",
    "profile_verification_status",
    "login_verification_status",
    "socket_id",
  ];
  const userWithSelectedFields = filterData(isUser.dataValues, attributes);

  const includeOptions = [
    {
      model: User,
      as: "User",
      attributes: [
        "profile_pic",
        "user_id",
        "full_name",
        "user_name",
        "email",
        "country_code",
        "country",
        "gender",
        "bio",
        "profile_verification_status",
        "login_verification_status",
        "socket_id",
      ],
    },
  ];
  const getChats_of_users =
    await participant_service.getParticipantWithoutPagenation({
      user_id: socket.authData.user_id,
    });
  if (getChats_of_users.Records.length > 0) {
    let chat_id = getChats_of_users.Records.map((chats) => {
      return chats.chat_id;
    });

    chat_id.forEach(async (element) => {
      let users

      if (element == data.chat_id) {

        users = await participant_service.getParticipantWithoutPagenation(
          { chat_id: element },
          includeOptions
        );
      }

      users?.Records.map((chats) => {
        if (
          chats.User.user_id != socket.authData.user_id
        ) {
          emitEvent(chats.User.socket_id, "typing", data,);
        }
      });
    });
  }
}
async function chat_list(socket, data, emitEvent) {

  const isUser = await getUser({ user_id: socket.authData.user_id });
  if (!isUser) {
    return next(new Error("User not found."));
  }
  attributes = [
    "profile_pic",
    "user_id",
    "full_name",
    "user_name",
    "email",
    "country_code",
    "country",
    "gender",
    "bio",
    "profile_verification_status",
    "login_verification_status",
    "socket_id",
  ];
  let user_data = { ...isUser.toJSON() };
  const keysToRemove = [
    "password",
    "otp",
    "id_proof",
    "selfie",
    "device_token",
  ];
  keysToRemove.forEach((key) => {
    user_data = filterData(user_data, key, "key");
  });
  const includeOptions = [
    {
      model: Message,
      include: [
        {
          model: User, // Assuming User is associated with Message
          attributes: [
            "profile_pic",
            "user_id",
            "full_name",
            "user_name",
            "email",
            "country_code",
            "country",
            "gender",
            "bio",
            "profile_verification_status",
            "login_verification_status",
            "socket_id",
          ],
        },
        {
          model: Social, // Assuming Social is associated with Message
        },
      ],
      order: [["createdAt", "DESC"]], // Order messages by latest createdAt

      limit: 1,
    },
  ];
  const foreignKeysConfig = [
    { foreign_key: "social_id", model: "Social", alias_name: "Social" },
  ];
  const getChats_of_users =
    await participant_service.getParticipantWithoutPagenation({
      user_id: socket.authData.user_id,
    });

  if (getChats_of_users.Records.length > 0) {
    const chatIds = getChats_of_users.Records.map((chats) => {

      return chats.chat_id;
    });

    const includeOptionsUser = [
      {
        model: User,
        as: "User",
        attributes: [
          "profile_pic",
          "user_id",
          "full_name",
          "user_name",
          "email",
          "country_code",
          "country",
          "gender",
          "bio",
          "profile_verification_status",
          "login_verification_status",
          "socket_id",
          'updatedAt',
          'createdAt'
        ],
      },
    ];
    let response = [];
    let total_records = chatIds.length;
    let currentPage = data?.page || 1;
    let pageSize = data?.pageSize || 10;
    let total_pages = Math.ceil(total_records / pageSize);
    let count = 0; // Initialize count for pagination logic

    // Calculate the range of chat IDs to process for the current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Loop through the filtered chat IDs within the current page range
    for (let i = startIndex; i < chatIds.length && count < pageSize; i++) {
      if (i == endIndex) {
        break;
      }
      const chatId = chatIds[i]; // Get the chat ID for the current iteration
      const unseenCount = await message_seen_service.getMessageSeenCount(
        {
          andConditions: {
            chat_id: chatId,
            user_id: isUser.user_id
          },
          orConditions: {
            message_seen_status: ["delivered", "sent"],

          },
        }
      )

      const users = await participant_service.getParticipantWithoutPagenation(
        {
          chat_id: chatId,
          user_id: { [Op.ne]: isUser.user_id }, // Exclude the current user
        },
        includeOptionsUser
      );


      if (users.Records.length > 0) {
        const PeerUserData = users.Records[0].User;

        const chats = await chat_service.getChats(
          { chat_id: chatId },
          includeOptions,
          { page: 1, pageSize: 1 }, // Fetch only the latest message
          foreignKeysConfig
        );

        if (chats.Records.length > 0) {
          chats.Records = chats.Records.map(record => ({
            ...record,
            unseen_count: unseenCount.count
          }));

          response.push({
            Records: chats.Records,
            PeerUserData,
          });
        } else {
          response.push({
            Records: [],
            PeerUserData,
          });
        }
      }

      count++; // Increment count for processed chats
    }

    // Emit the paginated response
    emitEvent(socket.id, "chat_list", {
      Pagination: {
        total_pages,
        total_records,
        current_page: currentPage,
        records_per_page: pageSize,
      },
      Chats: response,
    });
  } else {
    emitEvent(socket.id, "chat_list", { Chats: {Records: []}, Pagination: {
      total_pages:0,
      total_records:0,
      current_page: 0,
      records_per_page: 0,
    } });
  }
}

async function message_list(socket, data, emitEvent) {
  const isUser = await getUser({ user_id: socket.authData.user_id });

  if (!data.chat_id) {
    // actual_socket_id =
    return emitEvent(socket.id, "message_list", "Chat id is required");
  }

  if (!isUser) {
    return next(new Error("User not found."));
  }

  attributes = [
    "profile_pic",
    "user_id",
    "full_name",
    "user_name",
    "email",
    "country_code",
    "country",
    "gender",
    "bio",
    "profile_verification_status",
    "login_verification_status",
    "socket_id",
  ];

  const includeOptions = [
    {
      model: User,
      as: "User",
      attributes: [
        "profile_pic",
        "user_id",
        "full_name",
        "user_name",
        "email",
        "country_code",
        "country",
        "gender",
        "bio",
        "profile_verification_status",
        "login_verification_status",
        "socket_id",
      ],
    },
  ];

  const includeOptionsforChat = [
    {
      model: Message,
      as: "ParentMessage",
    },
    {
      model: Message,
      as: "Replies",
    },

    {
      model: User,
      attributes: [
        "profile_pic",
        "user_id",
        "full_name",
        "user_name",
        "email",
        "country_code",
        "country",
        "gender",
        "bio",
        "profile_verification_status",
        "login_verification_status",
        "socket_id",
      ],
    },
    {
      model: Social,
      required: false,
      include: [
        {
          model: User,
          attributes: [
            "user_id",
            "full_name",
            "user_name",
            "profile_pic",
            "email",
          ],
        },
      ],
    },
  ];
  const participants =
    await participant_service.getParticipantWithoutPagenation({
      user_id: socket.authData.user_id,
    });
  let emmitdata = []; // Initialize an empty array
  let listner_socket_id = []; // Initialize the array for socket IDs
  const foreignKeysConfig = [
    { foreign_key: "social_id", model: "Social", alias_name: "Social" },
  ];

  if (participants.Records.length > 0) {
    let chat_ids = participants.Records.map(
      (chats) => chats.chat_id
    );

    if (chat_ids.includes(data.chat_id)) {
      // Create an array of promises

      let aa = await participant_service.getParticipantWithoutPagenation(
        { chat_id: data.chat_id },
        includeOptions
      );

      let chats = await message_service.getMessages(
        {
          chat_id: data.chat_id,
          [Op.and]: [
            Sequelize.literal(`NOT ("Message"."deleted_for" @> ARRAY['${isUser.user_id}']::decimal[])`)
          ]
        },
        includeOptionsforChat,
        {
          page: data.page || 1,
          pageSize: data.pageSize || 10,
        },
        foreignKeysConfig
      );

      if (chats.Records?.length > 0) {

        for await (const element of chats.Records) {
          try {
            let update_status = await message_seen_service.updateMessageSeen(
              {
                message_id: element.message_id,
                user_id: isUser.toJSON().user_id
              },
              { message_seen_status: "seen" }
            );

            const seen_user_count = await message_seen_service.getMessageSeenCount(
              {
                andConditions: {
                  chat_id: element.chat_id,
                  message_id: element.message_id,
                  message_seen_status: 'seen'
                }

              }
            )
            if (aa.Records.length == seen_user_count.count && element.message_seen_status != "seen") {
              const message_status_content = await message_service.updateMessage({ message_id: element.message_id }, { message_seen_status: "seen" })
              const sender = await getUser({ user_id: element.sender_id })
              emitEvent(sender.socket_id, "message_seen_status", message_status_content[1][0]);

              // emmit_data_to_sender.push(element)
            }
            // const total_users_of_chats 

          } catch (error) {
            console.error('Error updating message seen:', error);
          }
        }



        emmitdata.push(chats);
        // Process users and append socket IDs to listner_socket_id
        // aa.Records.map((user) => {
        //   if (Number(user.User.user_id) === Number(isUser.user_id)) {
        //     listner_socket_id.push(user.User.socket_id);
        //   }
        // });

        // listner_socket_id.forEach((socket_id) => {
        //   emitEvent(socket_id, "message_list", emmitdata[0]);
        // });

        emitEvent(socket.id, "message_list", emmitdata[0]);
      }
      else {
        emitEvent(socket.id, "message_list", "No Messages Found");
      }
    } else {
      emitEvent(socket.id, "message_list", "Invalid Chat");
    }
  }
}
async function initial_onlineList(socket, emitEvent) {
  const isUser = await getUser({ user_id: socket.authData.user_id });
  let onlineUsers = [];
  // 
  if (!isUser) {
    return next(new Error("User not found."));
  }

  let user_data = { ...isUser.toJSON() };
  const keysToRemove = [
    "password",
    "otp",
    "id_proof",
    "selfie",
    "device_token"
  ];

  keysToRemove.forEach((key) => {
    user_data = filterData(user_data, key, "key");
  });

  const includeOptions = [
    {
      model: User,
      as: "User",
      attributes: [
        "mobile_num", "profile_pic", "dob", "user_id", "full_name", "user_name",
        "email", "country_code", "socket_id", "login_type", "gender",
        "country", "state", "city", "bio", "profile_verification_status",
        "login_verification_status", "is_private", "is_admin", "createdAt", "updatedAt"
      ],
    },
  ];

  let getChats_of_users = await participant_service.getParticipantWithoutPagenation({
    user_id: socket.authData.user_id,
  })
  if (getChats_of_users.Records.length > 0) {
    // Use Promise.all to wait for all async operations to finish
    const promises = getChats_of_users.Records.map(async (chats) => {
      const chat_id = chats.chat_id;
      let users = await participant_service.getParticipantWithoutPagenation({ chat_id }, includeOptions);

      const onlineUsersForChat = users.Records.filter((chats) => {
        const user = chats.User;
        return (
          user.socket_id &&
          user.socket_id.length > 0 &&
          user.user_id !== socket.authData.user_id
        );
      }).map((chats) => {
        chats.User.isOnline = true

        return chats.User
      }); // Extract user details

      onlineUsers.push(...onlineUsersForChat); // Push users into the main onlineUsers array
    });

    // Wait for all promises to resolve before emitting event
    await Promise.all(promises);

    // Emit the list of online users after all users are collected
    if (onlineUsers.length > 0) {

      emitEvent(socket.id, "initial_online_user", {
        onlineUsers: onlineUsers,
      });
    } else {
      emitEvent(socket.id, "initial_online_user", { onlineUsers: [] }); // Send empty list if no users found
    }
  }
  else {
    emitEvent(socket.id, "initial_online_user", { onlineUsers: [] }); // Send empty list if no users found

  }
}

async function real_time_message_seen(socket, data, emitEvent) {
  const isUser = await getUser({ user_id: socket.authData.user_id });
  const isMessage = await message_service.getMessages(
    {
      message_id: data.message_id,
      chat_id: data.chat_id
    }
  );
  if (isMessage) {
    const update_message_seen = await message_seen_service.updateMessageSeen({
      message_id: data.message_id,
      user_id: isUser.toJSON().user_id
    }, {
      message_seen_status: data.status
    })
    const seen_user_count = await message_seen_service.getMessageSeenCount(
      {
        andConditions: {
          chat_id: data.chat_id,
          message_id: data.message_id,
          message_seen_status: 'seen'
        }

      }
    )
    let aa = await participant_service.getParticipantWithoutPagenation(
      { chat_id: data.chat_id },
    );
    if (seen_user_count.count == aa.Records.length && update_message_seen[0] > 0) {
      const update_message = await message_service.updateMessage({ message_id: Number(data.message_id) }, { message_seen_status: "seen" })

      if (update_message[0] > 0) {

        sender = await getUser({ user_id: update_message[1][0].toJSON().sender_id })

        emitEvent(sender.socket_id, "real_time_message_seen", update_message[1][0].toJSON())
      }
    }
  }
  if (!isUser) {
    return next(new Error("User not found."));
  }

}

async function get_chat_id(socket, data) {
  try {
    const isUser = await getUser({ user_id: socket.authData.user_id });
    if (!isUser) {
      throw new Error("User not found.");
    }

    const participants =
      await participant_service.getParticipantWithoutPagenation({
        user_id: socket.authData.user_id,
      });

    // Create an array of chat_ids
    const chatIds = participants.Records.map(
      (participant) => participant.chat_id
    );

    // Extract chat_ids from participants
    const userChatIds = await Promise.all(
      chatIds.map(async (chat) => {
        const participants =
          await participant_service.getParticipantWithoutPagenation({
            chat_id: chat,
            user_id: { [Op.ne]: isUser.user_id }, // Exclude user with this user_id
          });

        // Extract user_ids for each chat
        return {
          chat_id: chat,
          user_id: participants.Records[0].user_id,
        };
      })
    );
    // Return chat IDs
    return { ChatIds: userChatIds };
  } catch (error) {
    // Throw the error to let the caller handle it
    throw new Error(error.message || "Failed to get chat IDs.");
  }
}

// Provide : {chat_id : chat id, message_id : message id}
async function delete_for_me(socket, data, emitEvent) {
  try {
    const isUser = await getUser({ user_id: socket.authData?.user_id });
    if (!data.chat_id) {
      // actual_socket_id =
      return emitEvent(socket.id, "message_list", "Chat id is required");
    }

    if (!isUser) {
      return next(new Error("User not found."));
    }

    const message = await message_service.getMessage(
      data
    );
    if (message && message.sender_id == isUser.user_id) {

      const deleted_message = !message.deleted_for.includes(isUser.user_id.toString()) ? message.deleted_for.push(isUser.user_id) : null

      if (deleted_message) {
        emitEvent(socket.id, "delete_for_me", deleted_message)
      }
      else {
        emitEvent(socket.id, "delete_for_me", "Message Already deleted")
      }
    }
    else {
      return emitEvent(socket.id, "delete_for_me", "You are not the sender of this message", success = false)
    }
  } catch (err) {
    console.log(err);
    throw new Error(err.message || "Failed to delete the message.");
  }
}

// Provide : {chat_id : chat id, message_id : message id}
async function delete_for_everyone(socket, data, emitEvent) {
  try {
    const isUser = await getUser({ user_id: socket.authData.user_id });

    if (!data.chat_id) {
      // actual_socket_id =
      return emitEvent(socket.id, "message_list", "Chat id is required");
    }

    if (!isUser) {
      return next(new Error("User not found."));
    }

    const message = await message_service.getMessage(
      data
    );

    if (message && message.sender_id == isUser.user_id) {
      const deleted_message = await message_service.updateMessage({ message_id: Number(data.message_id) }, { deleted_for_everyone: true, message_content: "This message was deleted." })
      if (deleted_message.length > 0) {
        const participants =
          await participant_service.getParticipantWithoutPagenation({
            user_id: socket.authData.user_id,
          });
        participants.Records?.map((socket) => emitEvent(socket.id, "delete_for_everyone", deleted_message[1][0].toJSON()))
        emitEvent(socket.id, "delete_for_everyone", deleted_message[1][0].toJSON())
      }
    }
    else {
      return emitEvent(success = false, socket.id, "delete_for_everyone", "You are not the sender of this message")
    }
  } catch (err) {
    console.log(err);
    throw new Error(err.message || "Failed to delete the message.");
  }

}

module.exports = {
  typing,
  chat_list,
  message_list,
  initial_onlineList,
  get_chat_id,
  real_time_message_seen,
  delete_for_me,
  delete_for_everyone
};
