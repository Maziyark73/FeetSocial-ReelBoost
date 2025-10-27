"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../utils/hooks";
import { hideModal, showModal } from "../../store/Slice/ModalsSlice";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
import LocationSearch from "@/app/components/LocationSearch";
import { clearSelectedMusic, clearVideo } from "@/app/store/Slice/MediaSlice";
import CaptionInput from "./CaptionInput";
import generateVideoThumbnail from "@/app/utils/generateVideoThumbnail";
import { ProjectConfigRes, UploadSocialRes } from "@/app/types/ResTypes";
import Cookies from "js-cookie";
import CustomDialog from "@/app/components/CustomDialog";
import useFFmpegVideo from "@/app/hooks/useFFmpegVideo";
import { toast } from "react-toastify";

function UploadReel() {
  const open = useAppSelector((state) => state.modals.UploadReel);
  const dispatch = useAppDispatch();

  const selectedMusic = useAppSelector((state) => state.media.selectedMusic);
  const caption = useAppSelector((state) => state.media.caption);
  const trimmedVideoFile = useAppSelector(
    (state) => state.media.trimmedVideoFile
  );
  const trimmedVideoUrl = useAppSelector(
    (state) => state.media.trimmedVideoUrl
  );

  const token = Cookies.get("Reelboost_auth_token");
  const [mediaflow, setMediaflow] = useState<"LOCAL" | "S3" | string>("");
  const [formData, setFormData] = useState({
    caption: "",
    music: "",
    location: "",
    video: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ only use hook
  const { ready, processVideo } = useFFmpegVideo();
  useEffect(() => {
    if (!token) return;

    const fetchConfig = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/project_conf`
        );
        const data: ProjectConfigRes = await res.json();
        if (data?.data?.mediaflow) setMediaflow(data.data.mediaflow);
      } catch (error) {
      }
    };
    fetchConfig();
  }, [token]);

  const handleSubmit = async () => {
    setLoading(true);
    if (!trimmedVideoFile) {
      alert("No video available!");
      setLoading(false);
      return;
    }

    const finalVideoFile = selectedMusic
      ? await processVideo({
          videoFile: trimmedVideoFile,
          musicUrl: selectedMusic.music_url,
        })
      : trimmedVideoFile;

    if (!finalVideoFile) {
      alert("Video processing failed!");
      setLoading(false);
      return;
    }

    const thumbnail = await generateVideoThumbnail(finalVideoFile);
    const blob = await fetch(thumbnail).then((res) => res.blob());
    const thumbFile = new File([blob], "thumbnail.png", { type: "image/png" });

    const formDataToSend = new FormData();
    formDataToSend.append("social_type", "reel");
    formDataToSend.append("social_desc", caption || "");
    formDataToSend.append("location", formData.location || "");

    if (selectedMusic?.music_id) {
      formDataToSend.append("music_id", String(selectedMusic.music_id));
    }

    if (mediaflow === "LOCAL") {
      formDataToSend.append("files", thumbFile);
      formDataToSend.append("files", finalVideoFile, finalVideoFile.name);
    } else {
      formDataToSend.append("file_media_1", thumbFile);
      formDataToSend.append("file_media_2", finalVideoFile, finalVideoFile.name);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/upload-social`,
        {
          method: "POST",
          body: formDataToSend,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const responseData: UploadSocialRes = await response.json();
      if (responseData.status) toast.success(responseData.message);

      dispatch(hideModal("UploadReel"));
      dispatch(clearSelectedMusic());
      dispatch(clearVideo());
      window.location.replace("/");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // keep Redux music in sync
  useEffect(() => {
    if (selectedMusic?.music_title) {
      setFormData((prev) => ({ ...prev, music: selectedMusic.music_title }));
    }
  }, [selectedMusic]);

  return (
    <CustomDialog
      open={open}
      onClose={() => dispatch(hideModal("UploadReel"))}
      title="Upload Reel"
      maxWidth="xs"
      fullWidth
    >
      <div className="px-6 py-2 space-y-3 sm:max-h-[90vh] max-h-[480px] sm:overflow-visible overflow-y-auto">
        <CaptionInput />

        {/* Music */}
        <label className="text-sm text-dark">Music</label>
        <div className="relative">
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full flex items-center justify-center background-opacityGradient">
            <Image src="/home/music.png" alt="User" width={20} height={20} />
          </div>
          <input
            type="text"
            className={`border border-border-color text-xs rounded-lg w-full py-4 my-1 pl-13 placeholder:text-xs placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-main-green ${
              selectedMusic ? "background-opacityGradient" : "bg-primary"
            }`}
            placeholder="Add Music"
            value={selectedMusic?.music_title || ""}
            readOnly
            onClick={() => dispatch(showModal("MusicList"))}
          />
          {selectedMusic && (
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => dispatch(clearSelectedMusic())}
            >
              <RxCross2 className="text-dark" />
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col gap-0.5">
          <label className="text-dark text-sm">Location</label>
          <div className="relative">
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full flex items-center justify-center background-opacityGradient">
              <Image src="/home/Location.png" alt="User" width={20} height={20} />
            </div>
            <LocationSearch
              value={formData.location}
              onChange={(loc) =>
                setFormData((prev) => ({ ...prev, location: loc }))
              }
              placeholder="Search Location"
            />
          </div>
        </div>

        {/* Preview */}
        {trimmedVideoUrl && (
          <div className="mt-4 rounded-lg w-[200px] h-[250px] mx-auto">
            <video
              src={trimmedVideoUrl}
              autoPlay
              loop
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <button
          className="bg-main-green text-primary w-full text-sm rounded-xl py-2 cursor-pointer"
          onClick={handleSubmit}
          disabled={!mediaflow}
        >
          {loading ? "Uploading" : "Upload"}
        </button>
      </div>
    </CustomDialog>
  );
}

export default UploadReel;
 