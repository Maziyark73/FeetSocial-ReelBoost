"use client"
import SearchAccountsPopup from "./SidebarComponents/SearchAccountsPopup"
import ShareReel from "../home/ShareReel"
import UploadReel from "../home/Upload/UploadReel"
import EditProfile from "../profile/EditProfile"
import MyFollowers from "../profile/MyFollowers"
import MyFollowing from "../profile/MyFollowing"
import OtherUserFollowers from "../profile/OtherUserFollowers"
import OtherUserFollowing from "../profile/OtherUserFollowing"
import Signin from "../signin/Signin"
import OtpForm from "../signin/OTPForm"
import Signup from "../signin/Signup"
import SelectAvatarModal from "../signin/SelectAvatarModal"
import LogoutPopup from "../home/LogoutPopup"
import BlockUser from "../profile/ProfileComponents/ReportBlockUser/BlockUser"
import SendLocationModal from "../message/Location/SendLocationModal"
import GiphyComponentModal from "../message/Gif/GiphyComponentModal"
import MainSearch from "./MainSearch"
import ReportType from "../profile/ProfileComponents/ReportBlockUser/ReportType"
import ReportConfirmation from "../profile/ProfileComponents/ReportBlockUser/ReportConfirmation"
import DeleteAccountPopup from "../setting/DeleteAccountPopup"
import MusicList from "../home/Upload/MusicList"
import UploadVideo from "../home/Upload/UploadVideo"
import TrimVideo from "../home/Upload/TrimVideo"
import DeleteSocial from "../home/DeleteSocial"
import ViewAudio from "../home/Upload/ViewAudio"
import OpenLiveVideo from "../live/OpenLiveVideo"
import FreeCoinPopup from "../Gift/FreeCoinPopup"
import SendGift from "../Gift/SendGift"
import InsufficientBalance from "../Gift/InsufficientBalance"
import GiftSentSuccessfully from "../Gift/GiftSentSuccessfully"
import PaymentGatewayOptions from "../Gift/PaymentGatewayOptions"
import RechargeSuccessful from "../Gift/RechargeSuccessful"
import MyGifts from "../Gift/MyGifts"
import SelectPaymentGatewayForWithdraw from "../setting/wallet/SelectPaymentGatewayForWithdraw"
import { SetStateAction } from "react"
import { SocialRecord } from "../types/Reels"

function DialogContainer() {
  return (
    <>
    <Signin />
    <OtpForm />
    <Signup />
    <SelectAvatarModal />
     <SearchAccountsPopup />
     <ShareReel />
     <UploadReel />
     <EditProfile />
     <MyFollowers />
     <MyFollowing />
     <OtherUserFollowers />
     <OtherUserFollowing />
     <LogoutPopup/>
     <BlockUser />
     <ReportType />
     <ReportConfirmation />
     <SendLocationModal />
     <GiphyComponentModal />
     <MainSearch />
    <DeleteAccountPopup />
    <MusicList />
    <UploadVideo />
    <TrimVideo />
    <DeleteSocial setReels={function (value: SetStateAction<SocialRecord[]>): void {
        throw new Error("Function not implemented.")
      } } />
    <ViewAudio />
    <OpenLiveVideo />
    <FreeCoinPopup />
    <SendGift />
    <InsufficientBalance />
    <GiftSentSuccessfully />
    <PaymentGatewayOptions />
    <RechargeSuccessful />
    <MyGifts />
    <SelectPaymentGatewayForWithdraw />
    </>
  )
}

export default DialogContainer
