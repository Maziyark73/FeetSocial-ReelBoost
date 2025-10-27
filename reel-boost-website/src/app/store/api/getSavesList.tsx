// store/api/fetchSavedList.ts
import axios from "axios";
import Cookies from "js-cookie";
import { SavedList } from "@/app/types/ResTypes";

export const fetchSavedList = async ({
  pageParam = 1,
  myUserId,
}: {
  pageParam?: number;
  myUserId: number;
}): Promise<SavedList> => {
  const token = Cookies.get("Reelboost_auth_token");

  const { data } = await axios.post<SavedList>(
    `${process.env.NEXT_PUBLIC_API_URL}/save/saved-list`,
    {
      save_by:myUserId,
      include: "Social",
      page: pageParam,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return data;
};
