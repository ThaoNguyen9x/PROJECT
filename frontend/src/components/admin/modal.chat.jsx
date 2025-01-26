import React, { useContext, useEffect, useState } from "react";
import { message, Modal, notification } from "antd";
import {
  callCreateGroupChat,
  callCreateCreateRoomPrivate,
  callGetChatRoomUsers,
  callGetMessagesByRoomId,
  callGetChatRoomGroups,
  callDeleteChatHistory,
  callChangeStatusMessage,
} from "../../services/api";
import { AuthContext } from "../share/Context";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import ChatSidebar from "./Chat/ChatSidebar";
import NoChatSelected from "./Chat/NoChatSelected";
import ChatContainer from "./Chat/ChatContainer";

const ModalChat = (props) => {
  const { openChat, setOpenChat } = props;
  const { user } = useContext(AuthContext);

  const [listChatRoomUsers, setListChatRoomUsers] = useState([]);
  const [listChatRoomGroups, setListChatRoomGroups] = useState([]);
  const [selectedChatRoomUser, setSelectedChatRoomUser] = useState(null);

  const [listMessages, setListMessages] = useState([]);
  const [listMessageWs, setListMessageWs] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const res = await callGetChatRoomUsers();
    if (res && res.data && res.statusCode === 200) {
      setListChatRoomUsers(res.data.result);
    }

    const res1 = await callGetChatRoomGroups();
    if (res1 && res1.data && res1.statusCode === 200) {
      setListChatRoomGroups(res1.data.result);
    }

    setLoading(false);
  };

  const selectChatRoomUser = async (user) => {
    setLoading(true);
    setSelectedChatRoomUser(user);
    setLoading(false);
  };

  // Tạo phòng chat
  const handleCreateRoomPrivate = async (account1Id, account2Id) => {
    const res = await callCreateCreateRoomPrivate(account1Id, account2Id);
    if (res && res.data) {
      message.success(res.message);
      fetchData();
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res?.error,
      });
    }
  };

  // Tạo group chat
  const handleCreateGroup = async ({ accountIds }) => {
    const res = await callCreateGroupChat({ accountIds });
    if (res && res.data) {
      message.success(res.message);
      fetchData();
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res?.error,
      });
    }
  };

  const fetchMessages = async () => {
    setLoading(true);

    const res = await callGetMessagesByRoomId(
      selectedChatRoomUser?.chatRoom?.id
    );

    if (res && res.data) {
      setListMessages(res.data.result);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (selectedChatRoomUser) {
      if (selectedChatRoomUser?.chatRoom?.id) {
        fetchMessages();
        setListMessages([]);
        setListMessageWs([]);
      }
    }
  }, [selectedChatRoomUser]);

  useEffect(() => {
    const sock = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`);
    const stompClient = Stomp.over(sock);

    stompClient.debug = () => {};

    const topic = `/topic/messages/room/${selectedChatRoomUser?.chatRoom?.id}`;

    stompClient.connect({}, () => {
      stompClient.subscribe(topic, (messageOutput) => {
        const messageBody = JSON.parse(messageOutput.body);

        if (messageBody.action === "DELETE") {
          setListMessageWs([]);
          fetchMessages();
          fetchData();
        } else {
          fetchData();
          fetchMessages();
          setListMessageWs((prevMessages) => [
            ...prevMessages,
            { ...messageBody },
          ]);
        }
      });
    });

    return () => stompClient.disconnect();
  }, [selectedChatRoomUser?.chatRoom?.id]);

  // Xóa lịch sử
  const handleDeleteChatHistory = async () => {
    setListMessageWs([]);

    const res = await callDeleteChatHistory(selectedChatRoomUser?.chatRoom?.id);

    if (res && res && res.statusCode === 200) {
      message.success(res.message);
      fetchMessages();
      fetchData();
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res.error,
      });
    }
  };

  // Đổi trạng thái tin nhắn
  const handleChangeStatusMessage = async () => {
    setListMessageWs([]);

    const res = await callChangeStatusMessage(
      selectedChatRoomUser?.chatRoom?.id
    );

    if (res && res.data) {
      fetchData();
      fetchMessages();
    }
  };

  return (
    <Modal
      open={openChat}
      onCancel={() => {
        fetchData();
        setOpenChat(false);
        setSelectedChatRoomUser(null);
      }}
      footer={null}
      closable={false}
      className="!w-2/3 top-10"
    >
      <div className="flex items-center justify-center">
        <div className="w-full h-[calc(100vh-8rem)]">
          <div className="flex h-full overflow-hidden">
            <ChatSidebar
              user={user}
              listChatRoomUsers={listChatRoomUsers}
              listChatRoomGroups={listChatRoomGroups}
              selectChatRoomUser={selectChatRoomUser}
              handleCreateRoomPrivate={handleCreateRoomPrivate}
              handleCreateGroup={handleCreateGroup}
              fetchData={fetchData}
            />

            {!selectedChatRoomUser ? (
              <NoChatSelected />
            ) : (
              <ChatContainer
                user={user}
                selectedChatRoomUser={selectedChatRoomUser}
                setSelectedChatRoomUser={setSelectedChatRoomUser}
                listMessages={listMessages}
                listMessageWs={listMessageWs}
                handleDeleteChatHistory={handleDeleteChatHistory}
                fetchData={fetchData}
                handleChangeStatusMessage={handleChangeStatusMessage}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalChat;
