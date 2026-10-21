import {
  getAllPlaylists2,
  getHeaderLectures,
  getHomeLectures,
  getHomeRecentLectures,
} from "../../lib/fetch";

export default async function handler(req, res) {
  try {
    const [playlists, headerLectures, lectures, recentLectures] = await Promise.all([
      getAllPlaylists2().catch(() => ({ playlists: [], playlistsTitle: {} })),
      getHeaderLectures().catch(() => null),
      getHomeLectures().catch(() => null),
      getHomeRecentLectures().catch(() => null),
    ]);

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({
      playlists: playlists?.playlists || [],
      playlistsTitle: playlists?.playlistsTitle || {},
      headerLectures: headerLectures || null,
      lectures: lectures || null,
      recentLectures: recentLectures || null,
    });
  } catch (error) {
    console.error("/api/lectures failed:", error);
    return res.status(200).json({
      playlists: [
        {
          id: "UUWsdcrre0WbCWML_PnuzoAg",
          title: "All Lectures",
        },
      ],
      playlistsTitle: {
        UUWsdcrre0WbCWML_PnuzoAg: "All Lectures",
      },
      headerLectures: null,
      lectures: null,
      recentLectures: null,
    });
  }
}
