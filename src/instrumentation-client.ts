import Clarity from "@microsoft/clarity";

const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

if (clarityId && process.env.NODE_ENV === "production") {
  Clarity.init(clarityId);
}
