import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MdKeyboardArrowLeft } from "react-icons/md";
import Cookies from "js-cookie";
import logo from "/Images/reelbostlogo1.png";
import Snapta from "/Images/ReelBoostlogo2.png";
import Dashboard1 from "/Images/dashboard1.png";
import Dashboard2 from "../../../public/Images/11111111111111111111111111111111111.png";

import PostList1 from "/Images/Reel.png";
import PostList2 from "../../../public/Images/relld.png";
import PostListh from "../../../public/Images/PostListh.png";
import StoriesList1 from "../../../public/Images/gift.png";
import StoriesList2 from "../../../public/Images/giftd.png";
import StoriesListh from "../../../public/Images/StoriesListh.png";

import giftc from "../../../public/Images/list12121212.png";
import giftcd from "../../../public/Images/giftcd.png";
import ReportList1 from "../../../public/Images/ReportList1.png";
import ReportList2 from "../../../public/Images/ReportList2.png";
import UserList1 from "../../../public/Images/userlisrrr.png";
import UserList2 from "/Images/UserList2.png";
import CountryWise1 from "/Images/flag12.png";
import CountryWise2 from "/Images/CountryWise2.png";
import CountryWiseh from "/Images/Flagh.png";
import HashtagList1 from "/Images/hashtag12.png";
import HashtagList2 from "/Images/HashtagList2.png";
import HashtagListh from "/Images/HashtagListh.png";
import LanguageList1 from "/Images/language12.png";
import LanguageList2 from "/Images/LanguageList2.png";
import LanguageListh from "/Images/LanguageListh.png";
import BlockList1 from "/Images/block12.png";
import BlockList2 from "/Images/BlockList2.png";
import BlockListh from "/Images/BlockListh.png";
import AvatarList1 from "/Images/empty-wallet.png";
import AvatarList2 from "/Images/empty-walletd.png";
import Settings1 from "../../../public/Images/setttingrrrr.png";
import Settings2 from "../../../public/Images/Settings2.png";
import cms1 from "/Images/cms121.png";
import cms2 from "/Images/cms2.png";
import cmsh from "/Images/cmsh.png";
import R2l from "/Images/recharge12.png"
import R2d from "/Images/R2d.png"
import Ml from "/Images/live12.png"
import Md from "/Images/muscid.png"
import ll from "/Images/1121.png"
import ld from "/Images/md.png"
import Arrow from "/Images/Arrow.png";
import noty1 from "/Images/notify12.png"
import noty2 from "/Images/noty2.png"
import { toggleSidebar } from "../../Appstore/Slice/sidebarSlice";
import { useState } from "react";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import { clearCoverImagegift } from "../../Appstore/Slice/AddImageSliceGift";
import { clearSelectedCategory } from "../../Appstore/Slice/CategorySelectedIDandValues";
import { clearSelectedCategoryGift } from "../../Appstore/Slice/AddGiftCategorySlice";
import { reset } from "../../Appstore/Slice/toggleSlice";
import toast from "react-hot-toast";

const options1 = [
    {
        name: "DASHBOARD",
        subOptions: [
            { name: "Dashboard", path: "/dashboard", src: Dashboard1, src1: Dashboard2 },
        ],
    },
    {
        name: "REEL",
        src: ReportList1,
        src1: ReportList2,
        subOptions: [
            { name: "Reel List", path: "/post-list", src: PostList1, src1: PostList2, srch: PostListh },
            {
                name: "Gift",
                src: StoriesList1,
                src1: StoriesList2,
                sub: [
                    { name: "Gift List", path: "/gift-list" },
                    { name: "Gift Add", path: "" },
                ],
            },

            {
                name: "Gift Category",
                src: giftc,
                src1: giftcd,
                sub: [
                    { name: "Gift Category List", path: "/gift-category" },
                    { name: "Gift Category Add", path: "" },
                ],
            },
        ],
    },
    {
        name: "LIST",
        src: ReportList1,
        src1: ReportList2,
        subOptions: [
            {
                name: "Report List",
                src: StoriesList1,
                src1: ReportList2,
                sub: [
                    { name: "User Report List", path: "/user-report-list" },
                    { name: "Reel Report List", path: "/reel-report-list" },
                ],
            },

            { name: "User List", path: "/user-list", src: UserList1, src1: UserList2 },
            { name: "Countrywise Users", path: "/country-wise-users", src: CountryWise1, src1: CountryWise2, srch: CountryWiseh },
            {
                name: "Hashtag",
                src: HashtagList1,
                src1: HashtagList2,
                sub: [
                    { name: "Hashtag List", path: "/hashtag-list" },
                    { name: "Hashtag  Add", path: "" },
                ],
            },
            {
                name: "Language",
                src: LanguageList1,
                src1: LanguageList2,
                sub: [
                    { name: "Language List", path: "/language-list" },
                    { name: "Language  Add", path: "" },
                ],
            },
            { name: "Block List", path: "/block-list", src: BlockList1, src1: BlockList2, srch: BlockListh },
            {
                name: "Avatar",
                src: UserList1,
                src1: UserList2,
                sub: [
                    { name: "Avatar List", path: "/avatar-list" },
                    { name: "Avatar  Add", path: "" },
                ],
            },

            {
                name: "Recharge Plan",
                src: R2l,
                src1: R2d,
                sub: [
                    { name: "Recharge Plan List", path: "/rechargeplan-list" },
                    { name: "Recharge Plan  Add", path: "" },
                ],
            },
            { name: "Recharge List", path: "/recharge-list", src: R2l, src1: R2d },
            { name: "Withdrawal List", path: "/withrawal-list", src: AvatarList1, src1: AvatarList2 },
            { name: "Live List", path: "/live-list", src: Ml, src1: Md },
            {
                name: "Music",
                src: ll,
                src1: ld,
                sub: [
                    { name: "Music List", path: "/music-list" },
                    { name: "Music  Add", path: "" },
                ],
            },



        ],
    },
    {
        name: "NOTIFICATION",
        subOptions: [
            {
                name: "Notification",
                src: noty1,
                src1: noty2,
                sub: [
                    { name: "Push Notification List", path: "/push-notification" },
                    { name: "Push Notification  Add", path: "" },
                ],
            },
        ],
    },

    {
        name: "SETTING",
        subOptions: [
            { name: "Settings", path: "/settings", src: Settings1, src1: Settings2 },
            { name: "CMS Pages", path: "/cms", src: cms1, src1: cms2, srch: cmsh },
        ],
    },
];



interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

function Sidebar({ }: SidebarProps) {
    const dispatch = useDispatch();
    const isSidebarOpen = useSelector((state: { sidebar: { isOpen: boolean } }) => state.sidebar.isOpen);

    const handleSidebar = () => {
        dispatch(toggleSidebar());
    };

    const [openSubMenu, setOpenSubMenu] = useState(null);

    const toggleSubMenu = (name) => {
        setOpenSubMenu(openSubMenu === name ? null : name);
    };

    const handleRemove = () => {
        Cookies.remove("userId");
    };

    const onClose = () => {
        dispatch(toggleSidebar());
    };
    const mediaflow = sessionStorage.getItem("mediaflow") || "LOCAL";
    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';



    const handalopenmodal = (item: any) => {


        if (item.name == "Gift Add") {
            if (mediaflow === "LOCAL") {
                dispatch(showModal("Add_Gift_Modal"))
                dispatch(clearCoverImagegift());
                dispatch(clearSelectedCategory());
                dispatch(clearSelectedCategoryGift())
                dispatch(reset())

            }
            else {
                dispatch(showModal("Add_Gift_ModalUploadS3"));
                dispatch(clearCoverImagegift());
                dispatch(clearSelectedCategory());
                dispatch(clearSelectedCategoryGift())
                dispatch(reset())
            }
        }
        else if (item.name == "Gift Category Add") {
            dispatch(showModal("AddGiftCategory"))
            dispatch(reset())
        }

        else if (item.name == "Hashtag  Add") {
            dispatch(showModal("AddHashtagModal"))
            dispatch(reset())
        }

        else if (item.name == "Language  Add") {
            dispatch(showModal("AddLanguage_Modal"))
            dispatch(reset())
        }

        else if (item.name == "Avatar  Add") {
            dispatch(showModal("AvatarUpload_Modal"));
            dispatch(reset())
        }

        else if (item.name == "Recharge Plan  Add") {
            dispatch(showModal("AddRechargeModal"));
            dispatch(reset());
        }


        else if (item.name == "Music  Add") {
            if (mediaflow === "LOCAL") {
                dispatch(showModal("MusicAdd_Modal"))
                dispatch(reset())
            }
            else {
                dispatch(showModal("UploadMusicModalWithS3"));
                dispatch(reset());
            }
        }

        else if (item.name == "Push Notification  Add") {
            dispatch(showModal("AddNotificationModal"));
            dispatch(reset())
        }

        else {
            return
        }


    }



    return (
        <div className={`transition-all duration-300 h-screen ${isSidebarOpen ? "w-20" : "xl:w-72"} text-[#5B5B5B] left-0 top-0 z-50 bg-primary  flex flex-col gap-10 fixed border border-bordercolortop`}>
            <div className="flex flex-col h-full">
                {/* Top Section: Logo & Toggle Arrow */}
                <div className="flex items-center justify-between px-6 pt-8">
                    <div className="flex items-center gap-2">
                        <img src={logo} className="w-8 h-8" />
                        {!isSidebarOpen && <img src={Snapta} alt="snapta" className="w-[75px]" />}
                    </div>
                    {/* Arrow */}
                    <div className="absolute z-50 -right-3 top-4">
                        <MdKeyboardArrowLeft
                            className={`w-6 h-6 cursor-pointer bg-[#5b5b5b70] xl:block hidden transition-transform duration-300 ${isSidebarOpen ? "" : "rotate-180"}`}
                            onClick={handleSidebar}
                        />
                    </div>
                    {/* Mobile close button */}
                    <button onClick={onClose} className="absolute text-2xl text-gray-600 top-4 right-4 xl:hidden">
                        ×
                    </button>
                </div>

                {/* Scrollable Menu Section */}
                <div className="flex-1 pr-1 mt-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                        {options1.map((section, index) => (
                            <div key={section.name}>
                                {!isSidebarOpen && <div className="px-6 pb-3 text-base font-semibold tracking-wide text-textcolor text-opacity-[53%]">{section.name}  </div>}

                                {/* Section Items */}
                                {section.subOptions.map((item, index) => {


                                    return (
                                        <div key={item.name} className="relative ml-2">
                                            {/* Main Option (with nested sub if exists) */}
                                            <div className="left-0 flex items-center justify-between w-full px-6 py-3 transition-all duration-200 cursor-pointer" onClick={() => (item.sub ? toggleSubMenu(item.name) : null)}>
                                                {item.sub ? (
                                                    <div className="flex items-center w-full">
                                                        <img src={item.src} className="w-5 h-5" alt={item.name} />
                                                        <span className={`ml-3 text-sm font-poppins text-sidebartextcolor ${isSidebarOpen ? "hidden" : ""}`}>{item.name}  </span>
                                                    </div>
                                                ) : (
                                                    <NavLink to={item.path} className={({ isActive }) => `flex items-center w-full ${isActive ? "text-transparent bg-clip-text bg-header font-semibold" : ""}`} onClick={handleRemove}>
                                                        {({ isActive }) => (
                                                            <div className="flex items-center  ">
                                                                {isActive && (
                                                                    <div className="absolute w-1 h-5 rounded-r -left-2 top-3 bottom-3 bg-header" /> //for the left line of active button
                                                                )}

                                                                <div className="relative w-5 h-5">
                                                                    <img src={isActive ? item.src1 : item.src} className="w-5 h-5 dark:group-hover:hidden" alt="default" />
                                                                    <img src={isActive ? item.src1 : item.srch} className="absolute top-0 left-0 hidden w-5 h-5 dark:group-hover:block" alt="hover" />
                                                                </div>

                                                                <span className={`ml-3 text-sm font-poppins ${isActive ? "text-maincolor" : "text-sidebartextcolor"} ${isSidebarOpen ? "hidden" : ""}`}>{item.name}  </span>
                                                            </div>
                                                        )}
                                                    </NavLink>
                                                )}

                                                {item.sub && (
                                                    <img src={Arrow} className={`w-4 h-4 transition-transform duration-200 ${openSubMenu === item.name ? "" : "-rotate-90"} ${isSidebarOpen ? "hidden" : ""}`} alt="Toggle Submenu" />
                                                )}
                                            </div>
                                            {item.sub && openSubMenu === item.name && (
                                                <div className={`relative ml-6 ${isSidebarOpen ? "hidden" : ""}`}>
                                                    <div
                                                        className={`absolute left-2 top-0 w-0.5 bg-gray-300`}
                                                        style={{
                                                            height: `${(item?.sub?.length || 0) * 28}px`, // 40px per item (adjust as per your padding)
                                                        }}
                                                    ></div>

                                                    <div className="pl-4">
                                                        {item.sub.map((subItem) => (
                                                            <div key={subItem.name} className="relative flex items-center">
                                                                <div className="absolute w-4 h-2 border-b-2 border-l-2 border-gray-300 rounded-bl-lg -left-2"></div>
                                                                {subItem.path ? (
                                                                    <NavLink
                                                                        to={subItem.path}
                                                                        className={({ isActive }) =>
                                                                            `flex items-center w-full px-6 py-2 transition-all duration-200 ${isActive ? "text-maincolor font-semibold" : "text-sidebartextcolor"
                                                                            }`
                                                                        }
                                                                        onClick={handleRemove}
                                                                    >
                                                                        <span className={`text-sm font-poppins ${isSidebarOpen ? "hidden" : ""}`}>{subItem.name}</span>
                                                                    </NavLink>
                                                                ) : (
                                                                    <div
                                                                        onClick={() => {
                                                                            handalopenmodal(subItem)
                                                                        }}
                                                                        className="flex items-center w-full px-6 py-2 text-sidebartextcolor transition-all duration-200 cursor-pointer hover:text-maincolor"
                                                                    >
                                                                        <span className={`text-sm font-poppins ${isSidebarOpen ? "hidden" : ""}`}>{subItem.name}</span>
                                                                    </div>
                                                                )}

                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
