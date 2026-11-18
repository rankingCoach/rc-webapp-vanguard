import { detectNetworkFromUrl } from "./utils";
import { describe, it, expect } from "vitest";

describe("detectNetworkFromUrl", () => {
  it("should detect Facebook from facebook.com URL", () => {
    expect(detectNetworkFromUrl("https://facebook.com/example")).toBe("facebook");
    expect(detectNetworkFromUrl("https://www.facebook.com/example")).toBe("facebook");
    expect(detectNetworkFromUrl("https://fb.com/example")).toBe("facebook");
  });

  it("should detect Instagram from instagram.com URL", () => {
    expect(detectNetworkFromUrl("https://instagram.com/example")).toBe("instagram");
    expect(detectNetworkFromUrl("https://www.instagram.com/example")).toBe("instagram");
  });

  it("should detect YouTube from youtube.com URL", () => {
    expect(detectNetworkFromUrl("https://youtube.com/@example")).toBe("youtube");
    expect(detectNetworkFromUrl("https://www.youtube.com/channel/example")).toBe("youtube");
    expect(detectNetworkFromUrl("https://youtu.be/example")).toBe("youtube");
  });

  it("should detect LinkedIn from linkedin.com URL", () => {
    expect(detectNetworkFromUrl("https://linkedin.com/company/example")).toBe("linkedin");
    expect(detectNetworkFromUrl("https://www.linkedin.com/in/example")).toBe("linkedin");
  });

  it("should detect Pinterest from pinterest.com URL", () => {
    expect(detectNetworkFromUrl("https://pinterest.com/example")).toBe("pinterest");
    expect(detectNetworkFromUrl("https://www.pinterest.com/example")).toBe("pinterest");
    expect(detectNetworkFromUrl("https://pin.it/example")).toBe("pinterest");
  });

  it("should detect TikTok from tiktok.com URL", () => {
    expect(detectNetworkFromUrl("https://tiktok.com/@example")).toBe("tiktok");
    expect(detectNetworkFromUrl("https://www.tiktok.com/@example")).toBe("tiktok");
  });

  it("should detect Twitter from twitter.com or x.com URL", () => {
    expect(detectNetworkFromUrl("https://twitter.com/example")).toBe("twitter");
    expect(detectNetworkFromUrl("https://www.twitter.com/example")).toBe("twitter");
    expect(detectNetworkFromUrl("https://x.com/example")).toBe("twitter");
  });

  it("should return undefined for unrecognized URLs", () => {
    expect(detectNetworkFromUrl("https://example.com")).toBeUndefined();
    expect(detectNetworkFromUrl("https://unknown-social-network.com")).toBeUndefined();
  });

  it("should return undefined for empty or invalid URLs", () => {
    expect(detectNetworkFromUrl("")).toBeUndefined();
    expect(detectNetworkFromUrl(null as any)).toBeUndefined();
    expect(detectNetworkFromUrl(undefined as any)).toBeUndefined();
  });

  it("should be case-insensitive", () => {
    expect(detectNetworkFromUrl("HTTPS://FACEBOOK.COM/EXAMPLE")).toBe("facebook");
    expect(detectNetworkFromUrl("HTTPS://INSTAGRAM.COM/EXAMPLE")).toBe("instagram");
  });
});
