import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  message,
  notification,
  Space,
  Spin,
} from "antd";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { Header } from "antd/es/layout/layout";
import { IoIosLogOut } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { FaRegBell } from "react-icons/fa6";
import {
  callGetAllNotifications,
  callGetChatRoomGroups,
  callGetChatRoomUsers,
  callLogout,
  callReadNotification,
  callReadNotificationMaintenance,
} from "../../services/api";
import { AuthContext } from "../share/Context";
import ModalProfile from "./modal.profile";
import ModalNotification from "./modal.notification";
import { TiMessages } from "react-icons/ti";
import ModalChat from "./modal.chat";

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [openProfile, setOpenProfile] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [listNotifications, setListNotifications] = useState([]);
  const [listMessages, setListMessages] = useState([]);
  const [notificationDetails, setNotificationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState({});
  const [stompClient, setStompClient] = useState(null);
  const [listChatRoomUsers, setListChatRoomUsers] = useState([]);
  const [listChatRoomGroups, setListChatRoomGroups] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const sock = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`);
    const client = Stomp.over(sock);

    client.debug = () => {};

    client.connect({}, () => {
      setStompClient(client);

      const topics = [
        `/topic/user-status`,
        `/topic/paymentNotifications/${user.id}`,
        `/topic/electricityUsageVerification/${user.id}`,
        `/topic/maintenance/${user.id}`,
        `/topic/admin/work-registrations/${user.id}`,
        `/topic/messages/${user.id}`,
        `/topic/adminNotifications/${user.id}`,
      ];

      topics.forEach((topic) => {
        client.subscribe(topic, (messageOutput) => {
          const data = JSON.parse(messageOutput.body);

          fetchData();
          fetchNotifications();

          if (topic === `/topic/user-status`) {
            setUserStatus((prev) => ({ ...prev, ...data }));
          } else if (topic.includes(`/topic/messages/`)) {
            setListMessages((prev) => [...prev, data]);
            message.success("Bạn có một tin nhắn mới.");
          } else {
            setListNotifications((prev) => [...prev, data]);
            notification.success({
              message: "Thông báo",
              description: "Bạn có một thông báo mới. Vui lòng kiểm tra.",
            });
          }
        });
      });

      client.send(
        "/app/user-status",
        {},
        JSON.stringify({ userId: user.id, status: "online" })
      );

      const handleTabClose = () => {
        if (client.connected) {
          client.send(
            "/app/user-status",
            {},
            JSON.stringify({ userId: user.id, status: "offline" })
          );
          client.disconnect();
        }
      };

      window.addEventListener("beforeunload", handleTabClose);

      return () => {
        handleTabClose();
        window.removeEventListener("beforeunload", handleTabClose);
      };
    });
  }, [user.id]);

  // Handle logout
  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res.statusCode === 200) {
      localStorage.removeItem("access_token");
      setUser({
        id: "",
        name: "",
        email: "",
        mobile: "",
        role: "",
      });
      message.success(res.message);
      navigate("/");
    }
  };

  const itemSetting = [
    {
      key: "1",
      label: (
        <div
          onClick={() => setOpenProfile(true)}
          className="flex items-center gap-2 py-1"
        >
          <IoSettingsOutline className="h-5 w-5" />
          Tài khoản
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          onClick={() => handleLogout()}
          className="flex items-center gap-2 py-1"
        >
          <IoIosLogOut className="h-5 w-5" />
          Đăng xuất
        </div>
      ),
    },
  ];

  const fetchNotifications = async () => {
    setLoading(true);

    const [res1] = await Promise.all([callGetAllNotifications()]);

    const allResults = [...res1.data.result];

    setListNotifications(
      allResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );

    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    
        let page = 1;
        let hasMore = true;
    
        while (hasMore) {
          const query = `page=${page}&pageSize=20`;
          const res = await callGetChatRoomUsers(
            query
          );
    
          if (res && res.data) {
            const messages = res.data.result
    
            hasMore = res.data.hasMore || messages.length === 20;
            page += 1;
          }
        }
    
        setListChatRoomUsers(res.data.result);
        setLoading(false);

    

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

  useEffect(() => {
    fetchNotifications();
    fetchData();
  }, []);

  const notificationItems =
    listNotifications.length > 0
      ? listNotifications.map((notification, index) => {
          const message = notification?.message
            ? JSON.parse(notification?.message)
            : null;

          const formattedDate = message?.paymentDate
            ? new Date(message?.paymentDate).toLocaleDateString()
            : "N/A";

          const formattedAmount = message?.paymentAmount
            ? message?.paymentAmount.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            : "N/A";

          let notificationText = "";

          if (message) {
            if (message.paymentStatus === "UNPAID") {
              notificationText = `Khách hàng có khoản thanh toán ${formattedAmount} hạn chót thanh toán vào ${formattedDate}.`;
            } else if (message.paymentStatus === "PAID") {
              notificationText = `Khách hàng vừa thanh toán thành công khoản tiền ${formattedAmount} vào ngày ${formattedDate}.`;
            } else if (message.status === "UNACTIV") {
              notificationText = `Khách hàng vui lòng kiểm tra đồng hồ số ${message?.meter?.serialNumber} đã được ghi chỉ số vào ngày ${message?.readingDate}.`;
            } else if (message.status === "ACTIV") {
              notificationText = `Đồng hồ số ${message?.meter?.serialNumber} đã được xác nhận vào ngày ${message?.readingDate}.`;
            } else if (message.companyName) {
              notificationText = `Khách hàng ${message?.directorName} của công ty ${message?.companyName} sau 3 ngày nữa sẽ đến sinh nhật.`;
            } else if (message.maintenanceDate) {
              notificationText = `Bạn có lịch bảo trì vào ngày ${message?.maintenanceDate}`;
            }
          }

          return {
            key: notification.id,
            label: (
              <div
                key={notification.id}
                onClick={() => {
                  setNotificationDetails(notification);
                  handleReadNotification(notification?.id);
                  setOpenNotification(true);
                }}
                className={`${
                  notification.status === "READ"
                    ? "text-gray-400"
                    : "text-black"
                } hover:text-blue-500 transition duration-300 ease-in-out`}
              >
                <p className="font-bold">
                  {message?.paymentStatus === "UNPAID"
                    ? "Thanh toán chờ xử lý"
                    : message?.paymentStatus === "PAID"
                    ? "Thanh toán thành công"
                    : message?.status === "UNACTIV"
                    ? "Chưa được xác nhận"
                    : message?.status === "ACTIV"
                    ? "Đã được xác nhận"
                    : message?.companyName
                    ? "Thông báo sinh nhật"
                    : message?.title
                    ? "Thông báo bảo trì"
                    : "Thông báo không xác định"}
                </p>
                <p>
                  {notificationText.length > 40
                    ? notificationText.substring(0, 40) + " ..."
                    : notificationText}
                </p>
              </div>
            ),
          };
        })
      : [{ key: "0", label: <p>Không có thông báo.</p> }];

  const handleReadNotification = async (id) => {
    const [res1, res2] = await Promise.all([
      callReadNotification(id),
      callReadNotificationMaintenance(id),
    ]);

    const allResults = [
      res1?.statusCode === 200 ? res1.data : null,
      res2?.statusCode === 200 ? res2.data : null,
    ].filter(Boolean);

    if (allResults.length > 0) {
      fetchNotifications(allResults);
    }
  };

  return (
    <>
      <Header className="flex items-center justify-between gap-3 xl:gap-5 bg-white px-4 shadow-md">
        <div>
          <Input
            placeholder="Search here..."
            className="focus:shadow-none focus:border-red-700 hover:border-red-700"
          />
        </div>
        <div className="flex items-center gap-3 xl:gap-5">
          <Button
            onClick={() => {
              setOpenChat(true);
              fetchData();
            }}
            className="!shadow-none border-none p-0"
          >
            <Badge
              size="default"
              count={listChatRoomUsers.reduce(
                (sum, chatUser) => sum + chatUser.unreadCount,
                0
              )}
            >
              <TiMessages className="w-6 h-6 text-blue-950" />
            </Badge>
          </Button>

          <Dropdown
            menu={{ items: notificationItems }}
            trigger={["click"]}
            placement="bottomLeft"
            arrow
          >
            <Button className="!shadow-none border-none p-0">
              <Badge
                size="default"
                count={
                  listNotifications.filter(
                    (notification) =>
                      (notification?.status === "PENDING" &&
                        notification?.recipient?.referenceId === user?.id) ||
                      (notification?.status === "PENDING" &&
                        ["Technician_Employee", "Technician_Manager"].includes(
                          user?.role?.name
                        ))
                  ).length
                }
              >
                <FaRegBell className="w-6 h-6 text-blue-950" />
              </Badge>
            </Button>
          </Dropdown>

          <Space direction="vertical">
            <Dropdown
              menu={{
                items: itemSetting,
              }}
              trigger={["click"]}
              placement="bottomLeft"
              arrow
            >
              <Button className="!shadow-none border-none p-0">
                <Avatar size={32} shape="square" className="bg-red-700">
                  {user?.role?.name[0]?.toUpperCase()}
                </Avatar>
                <h2 className="font-medium text-blue-950 hidden lg:block">
                  {user?.name}
                </h2>
              </Button>
            </Dropdown>
          </Space>
        </div>
      </Header>

      {/* Profile Modal */}
      <ModalProfile openProfile={openProfile} setOpenProfile={setOpenProfile} />

      {/* Notification Modal */}
      <ModalNotification
        openNotification={openNotification}
        setOpenNotification={setOpenNotification}
        notificationDetails={notificationDetails}
      />

      {/* Chat Modal */}
      <ModalChat
        fetchData={fetchData}
        listChatRoomUsers={listChatRoomUsers}
        listChatRoomGroups={listChatRoomGroups}
        openChat={openChat}
        setOpenChat={setOpenChat}
        userStatus={userStatus}
      />
    </>
  );
};

export default AppHeader;
