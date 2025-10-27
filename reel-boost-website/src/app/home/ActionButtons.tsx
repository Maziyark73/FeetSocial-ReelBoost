"use client";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { setActiveCommentPostId } from "../store/Slice/ActiveCommentBox";
import { showModal } from "../store/Slice/ModalsSlice";
import Cookies from "js-cookie";
import useApiPost from "../hooks/postData";
import { SocialRecord } from "../types/Reels";
import { LikeUnlikeResponse } from "../types/ResTypes";
import { toast } from "react-toastify";
import { setUserId } from "../store/Slice/UserIdHashtagIdSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  setCommentAddedFalse,
} from "../store/Slice/handleCommentCount";
import ReelComment from "./Comment/ReelComment";
import { setSelectedReelId } from "../store/Slice/SelectedReelDetail";
import { BsThreeDots } from "react-icons/bs";
import { PiMusicNotes } from "react-icons/pi";
import { setMusicData } from "../store/Slice/ViewAudioSlice";

interface ActionButtonsProps {
  reel: SocialRecord;
  setReels: React.Dispatch<React.SetStateAction<SocialRecord[]>>;
  user_id: number;
}

function ActionButtons({ reel, setReels, user_id }: ActionButtonsProps) {
  const commentAdded = useAppSelector(
    (state) => state.commentAdded.commentAdded
  );
  const MyUserId = Cookies.get("Reelboost_user_id");

  const dispatch = useAppDispatch();
  const token = Cookies.get("Reelboost_auth_token");
  const { postData } = useApiPost();
  const activeCommentPostId = useAppSelector(
    (state) => state.comment.activeCommentPostId
  );
  

  // View Audio ===============
  const handleViewAudio = () => {
    if (!token) {
      dispatch(showModal("Signin"));
    } else {
      dispatch(showModal("ViewAudio"));
      dispatch(
        setMusicData({
          musicId: reel.Music?.music_id,
          musicName: reel?.Music?.music_title,
          musicImage: reel?.Music?.music_thumbnail,
          total_socials: reel?.Music?.total_use,
        })
      );
    }
  };

  // Like =========================
  const handleLike = async () => {
    if (!token) {
      dispatch(showModal("Signin"));
      return;
    }

    setReels((prev) =>
      prev.map((r) =>
        r.social_id === reel.social_id
          ? {
              ...r,
              isLiked: r.isLiked === true ? false : true,
              total_likes:
                r.isLiked === true
                  ? (Number(r.total_likes) - 1)
                  : (Number(r.total_likes) + 1),
            }
          : r
      )
    );

    const response: LikeUnlikeResponse = await postData("/like/like-unlike", {
      social_id: reel.social_id,
      social_type: "reel",
      user_id: user_id,
    });

    if (response.status) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  // Bookmark ============================
  const handleBookmark = async () => {
    if (!token) {
      dispatch(showModal("Signin"));
      return;
    }

    setReels((prev) =>
      prev.map((r) =>
        r.social_id === reel.social_id
          ? {
              ...r,
              isSaved: r.isSaved === true ? false : true,
              total_saves:
                r.isSaved === true
                  ? (Number(r.total_saves) - 1)
                  : (Number(r.total_saves) + 1),
            }
          : r
      )
    );

    const response: LikeUnlikeResponse = await postData("/save/save-unsave", {
      social_id: reel.social_id,
    });
    if (response.status) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  // Comment ==============================
  const handleComment = () => {
    if (!token) {
      dispatch(showModal("Signin"));
    } else {
      dispatch(setActiveCommentPostId(reel.social_id));
      dispatch(setCommentAddedFalse());
    }
  };

  // Share ===========================
  const handleShare = () => {
    if (!token) {
      dispatch(showModal("Signin"));
    } else {
      dispatch(setSelectedReelId(reel.social_id));
      dispatch(showModal("ShareReel"));
    }
  };

  // user profile route ==================
  const router = useRouter();
  const handleUserRoute = (userId: number) => {
    if (!token) {
      dispatch(showModal("Signin"));
    } else {
      dispatch(setUserId(userId));
      router.push(`/profile/${userId}`);
    }
  };

  // send gift ===================
  function handleGift() {
    if (!token) {
      dispatch(showModal("Signin"));
    } else {
      dispatch(setSelectedReelId(reel.social_id));
      dispatch(setUserId(reel.User.user_id));
      dispatch(showModal("SendGift"));
    }
  }

  // load my gift ==================
  function handleMyGift() {
    if (!token) {
      dispatch(showModal("Signin"));
    } else {
      dispatch(setSelectedReelId(reel.social_id));
      dispatch(setUserId(reel.User.user_id));
      dispatch(showModal("MyGifts"));
    }
  }

  // to increase comment count ====================
  // useEffect(() => {
  //   if (commentAdded) {
  //     setReels((prevReels) =>
  //       prevReels.map((r) =>
  //         r.social_id === reel.social_id
  //           ? {
  //               ...r,
  //               total_comments: String(Number(r.total_comments || 0) + 1),
  //             }
  //           : r
  //       )
  //     );

  //     dispatch(setCommentAddedFalse());
  //   }
  // }, [commentAdded, dispatch, reel.social_id, setReels]);

  // to increase share count =========================
  const ReelSharedId = useAppSelector(
    (state) => state.commentAdded.ReelSharedId
  );

  // remove this whole useEffect block for ReelSharedId
  // useEffect(() => {
  //   if (ReelSharedId && ReelSharedId === reel.social_id) {
  //     // update once
  //     setReels((prevReels) =>
  //       prevReels.map((r) =>
  //         r.social_id === ReelSharedId
  //           ? {
  //               ...r,
  //               total_shares: (Number(r.total_shares) || 0) + 1,
  //             }
  //           : r
  //       )
  //     );

  //     // reset immediately after applying
  //     dispatch(setReelSharedFalse());
  //   }
  // }, [ReelSharedId, reel.social_id, dispatch]);

  return (
    <div className="flex flex-col gap-5 place-items-center translate-y-[200px]">
      {/* Music Icon */}
      {reel.Music != null && (
        <div
          className="relative w-8.5 h-8.5 cursor-pointer"
          onClick={handleViewAudio}
        >
          {/* Profile Image with custom shape */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              clipPath: "path('M0,0 H32 V44 H20 Q16,16 0,20 Z')",
              // ↑ changed Q curve from (12,28) → (12,20) for a deeper dip
            }}
          >
            <Image
              src={reel?.Music?.music_thumbnail}
              alt="Profile"
              fill
              className="object-cover rounded-lg"
            />
          </div>

          {/* Music Icon positioned at bottom-left */}
          <div className="absolute bottom-[-2px] left-[-2px] bg-transparent">
            <PiMusicNotes className="text-dark text-sm" />
          </div>
        </div>
      )}

      {/* Like */}
      <button
        className="flex flex-col gap-1.5 cursor-pointer place-items-center"
        onClick={handleLike}
      >
        <div className="rounded-full sm:bg-dark/[0.04] bg-primary/[0.4] p-2">
          <Image
            src={
              reel.isLiked === true
                ? "/home/filled_heart.png"
                : "/home/like.png"
            }
            alt="like"
            width={25}
            height={25}
          />
        </div>
        <p className="text-xs text-dark">{reel.total_likes}</p>
      </button>

      {/* Comment */}

      <div className="relative">
        <button
          onClick={handleComment}
          className="flex flex-col gap-1.5 cursor-pointer place-items-center"
        >
          <div className="rounded-full sm:bg-dark/[0.04] bg-primary/[0.4] p-2">
            <Image
              src="/home/comment.png"
              alt="comment"
              width={24}
              height={24}
            />
          </div>
          {commentAdded ? (
            <p className="text-xs text-dark">
              {reel?.total_comments + 1}
            </p>
          ) : (
            <p className="text-xs text-dark">{reel.total_comments}</p>
          )}
        </button>

        {activeCommentPostId === reel.social_id && (
          <div className="absolute left-[60px] bottom-10 h-[500px] w-[400px]">
            <ReelComment />
          </div>
        )}
      </div>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex flex-col gap-1.5 cursor-pointer place-items-center"
      >
        <div className="rounded-full sm:bg-dark/[0.04] bg-primary/[0.4] p-2">
          <Image src="/home/share.png" alt="share" width={24} height={24} />
        </div>
        {ReelSharedId === reel.social_id ? ( <p className="text-xs text-dark">{reel.total_shares + 1}</p> ) : (
          <p className="text-xs text-dark">{reel.total_shares}</p>
        )}
      </button>

      {/* Bookmark */}
      <button
        className="flex flex-col gap-1.5 cursor-pointer place-items-center"
        onClick={handleBookmark}
      >
        <div className="rounded-full sm:bg-dark/[0.04] bg-primary/[0.4] p-2">
          <Image
            src={
              reel.isSaved === true
                ? "/home/filled_bookmark.png"
                : "/home/bookmark.png"
            }
            alt="bookmark"
            width={23}
            height={23}
          />
        </div>
        <p className="text-xs text-dark">{reel.total_saves}</p>
      </button>

      {/* Delete Reel */}
      {reel.User.user_id == Number(MyUserId) && (
        <button onClick={() => dispatch(showModal("DeleteSocial"))}>
          <BsThreeDots className="text-dark" />
        </button>
      )}

      {/* profile pic */}
      <button
        className="cursor-pointer"
        onClick={() => handleUserRoute(reel.user_id)}
      >
        <div className="rounded-full w-8.5 h-8.5 ">
          <Image
            src={reel.User.profile_pic}
            alt="profile"
            height={30}
            width={30}
          />
        </div>
      </button>

      {/* Gift  */}
      {reel.user_id == Number(MyUserId) ? (
        <>
          <button
            onClick={handleMyGift}
            className="flex flex-col gap-1.5 cursor-pointer place-items-center"
          >
            <div className="rounded-full sm:bg-dark/[0.04] bg-primary/[0.4] p-2">
              <Image src="/gift/eye.png" alt="share" width={24} height={24} />
            </div>
          </button>
        </>
      ) : (
        <>
          <button onClick={handleGift} className="cursor-pointer">
            <Image src={"/home/gift.png"} alt="gift" width={28} height={28} />
          </button>
        </>
      )}
    </div>
  );
}

export default ActionButtons;
