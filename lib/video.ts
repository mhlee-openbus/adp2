import type { IconName } from "@/components/ui/Icon";
import type { VideoSource } from "./types";

export const SOURCE_LABEL: Record<VideoSource, string> = {
  youtube: "유튜브",
  vimeo: "비메오",
  upload: "자체 업로드",
};

export const SOURCE_ICON: Record<VideoSource, IconName> = {
  youtube: "youtube",
  vimeo: "film",
  upload: "upload-cloud",
};
