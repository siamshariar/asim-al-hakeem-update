import { youtube, constants } from "./config";
// Fix: Change import path from '../data/articles' to '../data/airticles-data'
import articles from "../data/airticles-data";
import { books } from "../data/books";
import { organizations } from "../data/organizations";
import { papers } from "../data/papers";
import { tafseers } from "../data/tafseers";
import { date } from "./format";
import { lectures as legacyLectures } from "../data/lectures";

let qnaData = null;
let qnCatData = null;
let qnaDataMtimeMs = 0;
let qnCatDataMtimeMs = 0;

const normalizeCategorySlug = (value) => {
	if (!value) return "";
	return String(value)
		.toLowerCase()
		.replace(/&amp;/g, "and")
		.replace(/&/g, "and")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
};

const sanitizeQnaText = (value) => {
	if (!value) return "";

	return String(value)
		.replace(/\r\n|\r/g, "\n")
		.replace(/\\r\\n|\\n|\\t/g, " ")
		.replace(/\u00a0/g, " ")
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<!--([\s\S]*?)-->/g, " ")
		.replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/\bwindow\.___gcfg\b[\s\S]*/gi, " ")
		.replace(/\.video-toolbar-item\.[^{\n]+\{[\s\S]*?\}/gi, " ")
		.replace(/\bTags?:\b/gi, " ")
		.replace(/\bViews?\b/gi, " ")
		.replace(/\s{2,}/g, " ")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
};

const getNodePath = () => {
	if (typeof window !== "undefined") {
		return null;
	}

	try {
		if (typeof globalThis.__non_webpack_require__ === "function") {
			return globalThis.__non_webpack_require__("path");
		}

		if (typeof require === "function") {
			return require("path");
		}
	} catch (error) {
		return null;
	}

	return null;
};

const loadQnaData = () => {
	if (typeof window !== 'undefined') {
		return { qna: [], qnCat: [] };
	}

	const fs = getNodeFs();
	const path = getNodePath();

	if (!fs || !path) {
		console.error('Q&A data loader: Node fs/path modules unavailable in this runtime');
		return { qna: [], qnCat: [] };
	}

	const qnaPath = path.join(process.cwd(), 'data', 'qna.json');
	const qnCatPath = path.join(process.cwd(), 'data', 'qnCat.json');

	try {
		const qnaMtimeMs = fs.statSync(qnaPath).mtimeMs;
		const qnCatMtimeMs = fs.statSync(qnCatPath).mtimeMs;

		if (!qnaData || qnaDataMtimeMs !== qnaMtimeMs) {
			qnaData = JSON.parse(fs.readFileSync(qnaPath, 'utf8'));
			qnaDataMtimeMs = qnaMtimeMs;
		}

		if (!qnCatData || qnCatDataMtimeMs !== qnCatMtimeMs) {
			qnCatData = JSON.parse(fs.readFileSync(qnCatPath, 'utf8'));
			qnCatDataMtimeMs = qnCatMtimeMs;
		}
	} catch (e) {
		console.error('Error reading qna json', e);
		qnaData = [];
		qnCatData = [];
		qnaDataMtimeMs = 0;
		qnCatDataMtimeMs = 0;
	}

	return { qna: qnaData, qnCat: qnCatData };
};


const normalizeArticle = (item) => {
	if (!item) return null;
	const slug = item.slug || item.postSlug || "";
	const title = item.title || item.postTitle || "";
	const image = item.image || item.imageSrc || "/img/articles/default.jpg";
	const dateValue = item.date || item.postDate || "";
	const excerpt = item.excerpt || item.postExcerpt || "";
	const description = item.description || excerpt;

	return {
		...item,
		type: item.type || "blog",
		slug,
		title,
		image,
		date: dateValue,
		excerpt,
		description,
		content: item.content || item.description || excerpt,
		featured: item.featured === true || item.home === "1",
		published: item.published !== false,
		postSlug: item.postSlug || slug,
		postTitle: item.postTitle || title,
		imageSrc: item.imageSrc || image,
		postDate: item.postDate || dateValue,
		postExcerpt: item.postExcerpt || excerpt,
	};
};

const normalizeBook = (item) => {
	if (!item) return null;
	const slug = item.slug || item.bookSlug || "";
	const title = item.title || item.bookName || "";
	const image = item.image || item.imageSrc || "/img/books/default.jpg";
	const excerpt = item.excerpt || item.bookExcerpt || item.bookDesc || "";
	const description = item.description || item.bookDesc || excerpt;
	const author = item.author || item.writer || "Sheikh Assim Al Hakeem";

	return {
		...item,
		type: item.type || "book",
		slug,
		title,
		image,
		excerpt,
		description,
		author,
		featured: item.featured === true || item.home === "1",
		published: item.published !== false,
		bookSlug: item.bookSlug || slug,
		bookName: item.bookName || title,
		bookExcerpt: item.bookExcerpt || excerpt,
		bookDesc: item.bookDesc || excerpt,
		imageSrc: item.imageSrc || image,
		writer: item.writer || author,
		downloadLink: item.downloadLink || item.purchaseLink || "",
		playlistLink: item.playlistLink || "",
		bookPageLink: item.bookPageLink || item.link || "",
	};
};

const normalizeQna = (item) => {
	if (!item) return null;
	const slug = item.slug || `qna-${item.id}`;
	const cleanText = (value) => {
		if (!value) return "";
		return sanitizeQnaText(value)
			.replace(/^QUESTION:\s*/i, "")
			.replace(/^ANSWER:\s*/i, "")
			.trim();
	};
	const getMediaFallbackText = (entry) => {
		if (!entry) return "";
		if (entry.audio_url || (Array.isArray(entry.audio_files) && entry.audio_files.length > 0)) {
			return "Audio answer available";
		}
		if (entry.has_video || entry.video_url || entry.embed_url || entry.video_count || (Array.isArray(entry.youtube_videos) && entry.youtube_videos.length > 0)) {
			return "Video answer available";
		}
		return "";
	};
	const question = cleanText(item.question || item.title || "");
	const mediaFallbackText = getMediaFallbackText(item);
	const content = cleanText(item.content || item.answer || mediaFallbackText);
	const excerpt = cleanText(item.excerpt || content || mediaFallbackText);
	const categorySlug = item.category_slug || item.cat_slug || normalizeCategorySlug(item.categories?.[0]);
	const categories = Array.isArray(item.categories) && item.categories.length > 0
		? item.categories
		: (categorySlug ? [categorySlug] : []);

	return {
		...item,
		type: item.type || "qna",
		slug,
		question,
		content,
		excerpt,
		categories,
		featured: item.featured === true || item.home === "1",
		published: item.published !== false,
		answer: cleanText(item.answer || mediaFallbackText || content),
		cat_slug: categorySlug || categories[0] || "",
	};
};

const youtubeCache = new Map();
const youtubeSuccessTtlMs = 1000 * 60 * 60 * 24;
const youtubeErrorTtlMs = 1000 * 60 * 30;

const getNodeFs = () => {
	if (typeof window !== "undefined") {
		return null;
	}

	try {
		if (typeof globalThis.__non_webpack_require__ === "function") {
			return globalThis.__non_webpack_require__("fs");
		}

		return eval("require")("fs");
	} catch (error) {
		return null;
	}
};

const getYoutubeCacheFilePath = () => {
	if (typeof window !== "undefined") {
		return null;
	}

	return `${process.cwd()}/data/youtube-videos.json`;
};

const normalizeYoutubeCacheKey = (url, cacheKey) =>
	cacheKey || url.replace(/([?&])key=[^&]+/, "$1key=CACHE");

const createCachedResponse = (body, status = 200) => ({
	status,
	ok: status >= 200 && status < 300,
	json: async () => body,
	text: async () => JSON.stringify(body),
	clone: () => createCachedResponse(body, status),
});

const readYoutubeDiskCache = () => {
	const fs = getNodeFs();
	const youtubeCacheFilePath = getYoutubeCacheFilePath();

	if (!fs || !youtubeCacheFilePath) {
		return { version: 1, updatedAt: null, entries: {} };
	}

	try {
		if (!fs.existsSync(youtubeCacheFilePath)) {
			return { version: 1, updatedAt: null, entries: {} };
		}

		const rawCache = fs.readFileSync(youtubeCacheFilePath, "utf8");
		const parsedCache = rawCache ? JSON.parse(rawCache) : {};
		if (parsedCache && parsedCache.entries && typeof parsedCache.entries === "object") {
			return parsedCache;
		}

		return {
			version: 1,
			updatedAt: null,
			entries: parsedCache && typeof parsedCache === "object" ? parsedCache : {},
		};
	} catch (error) {
		return { version: 1, updatedAt: null, entries: {} };
	}
};

const getYoutubeDiskCacheEntries = () => readYoutubeDiskCache().entries || {};

const getYoutubeCacheTtl = (body) => (body?.error ? youtubeErrorTtlMs : youtubeSuccessTtlMs);

const isYoutubeCacheEntryFresh = (entry) => {
	if (!entry?.cachedAt) {
		return false;
	}

	const cachedAt = new Date(entry.cachedAt).getTime();
	if (Number.isNaN(cachedAt)) {
		return false;
	}

	const ttlMs = entry.ttlMs || getYoutubeCacheTtl(entry.body);
	return Date.now() - cachedAt < ttlMs;
};

const persistYoutubeCacheEntry = (cacheKey, status, body) => {
	try {
		const fs = getNodeFs();
		const youtubeCacheFilePath = getYoutubeCacheFilePath();

		if (!fs || !youtubeCacheFilePath) {
			return;
		}

		const currentCache = readYoutubeDiskCache();
		const entries = currentCache.entries && typeof currentCache.entries === "object" ? currentCache.entries : {};
		const nextCache = {
			version: 1,
			updatedAt: new Date().toISOString(),
			entries: {
				...entries,
				[cacheKey]: {
					cachedAt: new Date().toISOString(),
					ttlMs: getYoutubeCacheTtl(body),
					status,
					body,
				},
			},
		};

		const cacheDirectory = youtubeCacheFilePath.split("/").slice(0, -1).join("/");
		fs.mkdirSync(cacheDirectory, { recursive: true });
		fs.writeFileSync(youtubeCacheFilePath, `${JSON.stringify(nextCache, null, 2)}\n`, "utf8");
	} catch (error) {
		// Ignore cache write failures so builds still succeed.
	}
};

const getCachedYoutubeJson = async (url, cacheKey) => {
	const normalizedKey = normalizeYoutubeCacheKey(url, cacheKey);
	if (youtubeCache.has(normalizedKey)) {
		return youtubeCache.get(normalizedKey);
	}

	const diskEntry = getYoutubeDiskCacheEntries()[normalizedKey];
	if (diskEntry && isYoutubeCacheEntryFresh(diskEntry)) {
		const diskPromise = Promise.resolve(diskEntry.body);
		youtubeCache.set(normalizedKey, diskPromise);
		return diskPromise;
	}

	const promise = (async () => {
		const response = await getYoutubeResponseByUrl(url);
		return await response.json();
	})();

	youtubeCache.set(normalizedKey, promise);
	return promise;
};

const mapLegacyLecture = (item, index) => ({
	id: item.postID || item.id || `${index + 1}`,
	title: item.postTitle || item.title || "Untitled lecture",
	image: item.imageSrc || item.image || "/img/post/youtube-default.jpg",
	date: item.postDate || item.date || "",
	description: item.postExcerpt || item.description || "",
	playlistId: youtube.uploadPlaylistID,
});

const getLegacyLectureFallback = (limit = 4) => {
	const items = legacyLectures
		.filter((item) => item.home === "1" || item.recent === "1")
		.slice(0, limit)
		.map(mapLegacyLecture);

	return {
		videoLists: items,
		videoStats: {},
	};
};

const getDefaultPlaylistFallback = () => ({
	playlists: [
		{
			id: youtube.uploadPlaylistID,
			title: "Video Lectures",
		},
	],
	playlistsTitle: {
		[youtube.uploadPlaylistID]: "Video Lectures",
	},
});

// articles
const filterArticles = (items) => {
	let filtered = [];
	items.forEach((item) => {
		let obj = normalizeArticle(item);
		filtered.push(obj);
	});
	return filtered;
};

export const getHomeArticles = async () => {
	const items = articles.filter((item) => item.home === "1");
	return filterArticles(items);
};

export const getArticles = () => {
	return filterArticles(articles);
};

export const getRelatedArticles = () => {
	const items = articles.filter((item) => item.related === "1");
	return filterArticles(items);
};

export const getArticleDetails = (slug) => {
	const items = articles.filter((item) => item.postSlug === slug || item.slug === slug);
	return normalizeArticle(items[0]);
};

export const getHomeQna = async () => {
	const normalizedItems = loadQnaData().qna
		.filter(hasValidAnswer)
		.map(normalizeQna)
		.filter((item) => {
			// Exclude women's clothing category
			if (item && item.categories && item.categories.includes('women-clothing')) {
				return false;
			}
			return item && item.published !== false;
		});

	const sortedItems = normalizedItems.sort((a, b) => {
		const dateA = new Date(a?.date || 0).getTime();
		const dateB = new Date(b?.date || 0).getTime();

		if (dateA !== dateB) {
			return dateB - dateA;
		}

		const idA = Number(a?.id) || 0;
		const idB = Number(b?.id) || 0;
		return idB - idA;
	});

	return sortedItems.slice(0, 3);
};

// books
const filterBooks = (items) => {
	let filtered = [];
	items.forEach((item) => {
		let obj = normalizeBook(item);
		filtered.push(obj);
	});
	return filtered;
};

export const getHomeBooks = async () => {
	const items = books.filter((item) => item.home === "1");
	return filterBooks(items);
};

export const getBooks = () => {
	return filterBooks(books);
};

export const getRelatedBooks = () => {
	const items = books.filter((item) => item.related === "1");
	return filterBooks(items);
};

export const getBookDetails = (slug) => {
	const items = books.filter((item) => item.bookSlug === slug || item.slug === slug);
	return normalizeBook(items[0]);
};

export const getHomeRecentLectures = async () => {
	const url = `${youtube.url}/playlistItems?key=${youtube.key}&part=snippet&playlistId=${youtube.uploadPlaylistID}&maxResults=${constants.YOUTUBE_HOME_PAGE_RECENT_VIDEOS}`;
	const videoLists = await getYoutubeVideoListByUrl(url);
	if (videoLists?.videoLists?.videos?.length) {
		return videoLists;
	}

	return getLegacyLectureFallback(constants.YOUTUBE_HOME_PAGE_RECENT_VIDEOS);
};

export const getHomeLectures = async () => {
	const url = `${youtube.url}/playlistItems?key=${youtube.key}&part=snippet&playlistId=${youtube.uploadPlaylistID}&maxResults=${constants.DEFAULT_PAGE_LIMIT}`;
	const lectures = await getYoutubeVideoListByUrl(url);
	if (!lectures?.videoLists?.videos?.length) {
		const fallback = getLegacyLectureFallback(8);
		return {
			videoLists: fallback.videoLists,
			videoStats: fallback.videoStats,
		};
	}
	return {
		videoLists: lectures.videoLists.videos.slice(0, 8),
		videoStats: lectures.videoLists.videoStats,
	};
};

export const getHeaderLectures = async () => {
	const url = `${youtube.url}/playlistItems?key=${youtube.key}&part=snippet&playlistId=${youtube.uploadPlaylistID}&maxResults=${constants.DEFAULT_PAGE_LIMIT}`;
	const lectures = await getYoutubeVideoListByUrl(url);
	if (!lectures?.videoLists?.videos?.length) {
		const fallback = getLegacyLectureFallback(4);
		return {
			videoLists: fallback.videoLists,
			videoStats: fallback.videoStats,
		};
	}

	return {
		videoLists: lectures.videoLists.videos.slice(0, 4),
		videoStats: lectures.videoLists.videoStats,
	};
};

// organizations
const filterOrganizations = (items) => {
	let filtered = [];
	items.forEach((item) => {
		let obj = {
			id: item.id,
			orgName: item.orgName,
			imageSrc: item.imageSrc,
			orgExcerpt: item.orgExcerpt,
			orgSlug: item.orgSlug,
		};
		filtered.push(obj);
	});
	return filtered;
};

export const getHomeOrganizations = async () => {
	const items = organizations.filter((item) => item.home === "1");
	return filterOrganizations(items);
};

export const getOrganizations = async () => {
	return filterOrganizations(organizations);
};

export const getOrganizationDetails = async (slug) => {
	const items = organizations.filter((item) => item.orgSlug === slug);
	return items[0];
};

// papers
const filterPapers = (items) => {
	let filtered = [];
	items.forEach((item) => {
		let obj = {
			id: item.id,
			catURL: item.catURL,
			catText: item.catText,
			postSlug: item.postSlug,
			postTitle: item.postTitle,
			postDate: item.postDate,
			link: item.link,
		};
		filtered.push(obj);
	});
	return filtered;
};

export const getHomePapers = async () => {
	const items = papers.filter((item) => item.home === "1");
	return filterPapers(items);
};

export const getPapers = () => {
	return filterPapers(papers);
};

export const getRelatedPapers = () => {
	const items = papers.filter((item) => item.related === "1");
	return filterPapers(items);
};

export const getPaperDetails = (slug) => {
	const items = papers.filter((item) => item.postSlug === slug);
	return items[0];
};

// tafseers
const filterTafseers = (items) => {
	let filtered = [];
	items.forEach((item) => {
		let obj = {
			id: item.id,
			imageSrc: item.imageSrc,
			catURL: item.catURL,
			catText: item.catText,
			postSlug: item.postSlug,
			postTitle: item.postTitle,
			postDate: item.postDate,
		};
		filtered.push(obj);
	});
	return filtered;
};

export const getTafseers = () => {
	return filterTafseers(tafseers);
};

export const getRelatedTafseers = () => {
	const items = tafseers.filter((item) => item.related === "1");
	return filterTafseers(items);
};

export const getTafseerDetails = (slug) => {
	const items = tafseers.filter((item) => item.postSlug === slug);
	return items[0];
};

export const getAllPlaylists2 = async () => {
	const cacheKey = `playlists:${youtube.channelID}`;
	if (youtubeCache.has(cacheKey)) {
		return youtubeCache.get(cacheKey);
	}

	const promise = (async () => {
	const url = `${youtube.url}/playlists?key=${youtube.key}&part=snippet&channelId=${youtube.channelID}&maxResults=${constants.MAX_YOUTUBE_PAGE_LIMIT}`;
	const res = await getYoutubeResponseByUrl(url);
  
	let data = await res.json();
	if (!data || data.error || !data.items || !Array.isArray(data.items)) {
	  console.error('Unexpected API response format:', data);
	  return getDefaultPlaylistFallback();
	}
  
	let items = data.items;
	const total = data.pageInfo.totalResults;
  
	if (total > 50) {
	  const numberOfRequests = Math.ceil(total / 50);
	  for (let i = 1; i < numberOfRequests; i++) {
		let newURL = url + `&pageToken=${data.nextPageToken}`;
				data = await getCachedYoutubeJson(newURL);
  
		if (!data || data.error || !data.items || !Array.isArray(data.items)) {
		  console.error('Unexpected API response format during pagination:', data);
		  continue;
		}
  
		let newItems = data.items;
		items = items.concat(newItems);
	  }
	}
  
	let playlists = [];
	let playlistsTitle = {};
  
	let obj = {
	  id: youtube.uploadPlaylistID,
	  title: "Video Lectures",
	};
	playlists.push(obj);
	playlistsTitle[youtube.uploadPlaylistID] = "Video Lectures";
  
	items.forEach((item) => {
	  if (item && item.snippet) {
		let obj = {
		  id: item.id,
		  title: item.snippet.title,
		};
		playlists.push(obj);
		playlistsTitle[item.id] = item.snippet.title;
	  } else {
		console.error('Undefined item or item.snippet encountered:', item);
	  }
	});
  
	return { playlists, playlistsTitle };
	})();

	youtubeCache.set(cacheKey, promise);
	return promise;
};

export const getYoutubeVideoListByUrl = async (url) => {
	const videosData = await getCachedYoutubeJson(url);
	
	// Handle API errors (quota exceeded, etc.)
	if (videosData.error) {
		console.warn('YouTube API error:', videosData.error.message);
		return {
			videoLists: {
				videos: getLegacyLectureFallback(constants.YOUTUBE_HOME_PAGE_RECENT_VIDEOS).videoLists,
				videoStats: getLegacyLectureFallback(constants.YOUTUBE_HOME_PAGE_RECENT_VIDEOS).videoStats,
				nextPageToken: null,
				numberOfPages: 1,
			},
			nextPageToken: null
		};
	}
	
	const videoItems = Array.isArray(videosData.items) ? videosData.items : [];
	const nextPageToken = videosData.nextPageToken || null;
	const totalVideos = videosData.pageInfo?.totalResults || videoItems.length;
	const numberOfPages = Math.max(1, Math.ceil(totalVideos / constants.DEFAULT_PAGE_LIMIT));
	let videos = [];
	let videoIds = "";

	videoItems.forEach((item) => {
		if (!item?.snippet) {
			return;
		}
		const title = item.snippet.title.toString();
		if (
			title === "Private watch" ||
			title === "Private video" ||
			title === "Deleted video"
		) {
			// Skip private videos
		} else {
			let image =
				typeof item.snippet.thumbnails.high !== "undefined"
					? item.snippet.thumbnails.high.url
					: "";
			let obj = {
				id: item.snippet.resourceId.videoId,
				image: image,
				title: title,
				date: item.snippet.publishedAt,
				playlistId: item.snippet.playlistId,
			};
			videos.push(obj);
			videoIds += "," + item.snippet.resourceId.videoId;
		}
	});

	const statsURL = `${youtube.url}/videos?key=${youtube.key}&part=statistics&id=${videoIds}&maxResults=${constants.DEFAULT_PAGE_LIMIT}`;
	const statsRes = await getYoutubeResponseByUrl(statsURL);

	const videoStats = await statsRes.json();
	let videoStatistics = {};

	(Array.isArray(videoStats.items) ? videoStats.items : []).forEach((item) => {
		videoStatistics[item.id] = item.statistics.viewCount;
	});

	if (!videos.length) {
		const fallback = getLegacyLectureFallback(constants.YOUTUBE_HOME_PAGE_RECENT_VIDEOS);
		return {
			videoLists: {
				videos: fallback.videoLists,
				videoStats: fallback.videoStats,
				nextPageToken: null,
				numberOfPages: 1,
			},
			nextPageToken: null,
		};
	}

	let videoLists = {
		nextPageToken: nextPageToken,
		numberOfPages: numberOfPages,
		videos: videos,
		videoStats: videoStatistics,
	};

	return { videoLists };
};

export const getRelatedYoutubeVideoListByUrl = async (url) => {
	const videosData = await getCachedYoutubeJson(url);
	const videoItems = Array.isArray(videosData.items) ? videosData.items : [];
	const nextPageToken = videosData.nextPageToken || null;
	const totalVideos = videosData.pageInfo?.totalResults || videoItems.length;
	const numberOfPages = Math.max(1, Math.ceil(totalVideos / constants.DEFAULT_PAGE_LIMIT));
	let videos = [];
	let videoIds = "";

	videoItems.forEach((item) => {
		if (typeof item.snippet != "undefined") {
			const title = item.snippet.title.toString();
			if (title != "Private watch") {
				let image =
					typeof item.snippet.thumbnails.high !== "undefined"
						? item.snippet.thumbnails.high.url
						: "";
				let obj = {
					id: item.id.videoId,
					image: image,
					title: title,
					date: item.snippet.publishedAt,
					playlistId: item.snippet.playlistId,
				};
				videos.push(obj);
				videoIds += "," + item.id.videoId;
			}
		}
	});

	const statsURL = `${youtube.url}/videos?key=${youtube.key}&part=statistics&id=${videoIds}&maxResults=${constants.DEFAULT_PAGE_LIMIT}`;
	const statsRes = await getYoutubeResponseByUrl(statsURL);

	const videoStats = await statsRes.json();
	let videoStatistics = {};

	(Array.isArray(videoStats.items) ? videoStats.items : []).forEach((item) => {
		videoStatistics[item.id] = item.statistics.viewCount;
	});

	let videoLists = {
		nextPageToken: nextPageToken,
		numberOfPages: numberOfPages,
		videos: videos,
		videoStats: videoStatistics,
	};

	return { videoLists };
};

export const getUploadPlaylistVideos = async () => {
	const url = `${youtube.url}/playlistItems?key=${youtube.key}&part=snippet&playlistId=${youtube.uploadPlaylistID}&maxResults=${constants.MAX_YOUTUBE_PAGE_LIMIT}`;
	let data = await getCachedYoutubeJson(url);

	let videoItems = Array.isArray(data.items) ? data.items : [];

	const total = data.pageInfo?.totalResults || videoItems.length;
	let videoIdList = [];

	if (total > 50) {
		const numberOfRequests = Math.ceil(total / 50);
		for (let i = 1; i < numberOfRequests; i++) {
			let newURL = url + `&pageToken=${data.nextPageToken}`;
			data = await getCachedYoutubeJson(newURL);
			let newItems = Array.isArray(data.items) ? data.items : [];
			videoItems = videoItems.concat(newItems);
		}
	}

	videoItems.forEach((item) => {
		if (typeof item != "undefined") {
			const title = item.snippet.title.toString();
			if (title != "Private watch") {
				let obj = {
					id: item.snippet.resourceId.videoId,
				};
				videoIdList.push(obj);
			}
		}
	});

	return { videoIdList };
};

export const getYoutubeVideoDetailsByUrl = async (url) => {
	const res = await getYoutubeResponseByUrl(url);
	const data = await res.json();
	const firstItem = Array.isArray(data.items) ? data.items[0] : null;

	if (!firstItem) {
		return { title: "", description: "", publishedDate: "", image: "", viewCount: "" };
	}

	const title = firstItem.snippet?.title || "";
	const description = firstItem.snippet?.description || "";
	const publishedDate = firstItem.snippet?.publishedAt ? date(firstItem.snippet.publishedAt) : "";
	const image = firstItem.snippet?.thumbnails?.high?.url || "";
	const viewCount = firstItem.statistics?.viewCount || "";

	return { title, description, publishedDate, image, viewCount };
};

const fetchUrl = async (url) => {
	return await fetch(url);
};

const getYoutubeResponseByUrl = async (url) => {
	const cacheKey = normalizeYoutubeCacheKey(url);
	if (youtubeCache.has(cacheKey)) {
		const cachedBody = await youtubeCache.get(cacheKey);
		return createCachedResponse(cachedBody, cachedBody?.error ? 403 : 200);
	}

	const diskEntry = getYoutubeDiskCacheEntries()[cacheKey];
	if (diskEntry && isYoutubeCacheEntryFresh(diskEntry)) {
		youtubeCache.set(cacheKey, Promise.resolve(diskEntry.body));
		return createCachedResponse(diskEntry.body, diskEntry.status || (diskEntry.body?.error ? 403 : 200));
	}

	const res = await fetchUrl(url);
	try {
		const body = await res.clone().json();
		youtubeCache.set(cacheKey, Promise.resolve(body));
		persistYoutubeCacheEntry(cacheKey, res.status, body);
	} catch (error) {
		// Leave uncached if the payload cannot be parsed.
	}

	return res;
};

export const getYoutubeSearchVideosByUrl = async (url) => {
	const videosData = await getCachedYoutubeJson(url);
	const videoItems = Array.isArray(videosData.items) ? videosData.items : [];
	const nextPageToken = videosData.nextPageToken || null;
	const totalVideos = videosData.pageInfo?.totalResults || videoItems.length;
	const numberOfPages = Math.max(1, Math.ceil(totalVideos / constants.DEFAULT_PAGE_LIMIT));
	let videos = [];
	let videoIds = "";

	videoItems.forEach((item) => {
		const title = item.snippet.title.toString();
		if (
			title === "Private watch" ||
			title === "Private video" ||
			title === "Deleted video"
		) {
			// Skip
		} else {
			let image =
				typeof item.snippet.thumbnails.high !== "undefined"
					? item.snippet.thumbnails.high.url
					: "";
			let obj = {
				id: item.id.videoId,
				image: image,
				title: title,
				date: item.snippet.publishedAt,
			};
			videos.push(obj);
			videoIds += "," + item.id.videoId;
		}
	});

	const statsURL = `${youtube.url}/videos?key=${youtube.key}&part=statistics&id=${videoIds}&maxResults=${constants.DEFAULT_PAGE_LIMIT}`;
	const statsRes = await getYoutubeResponseByUrl(statsURL);

	const videoStats = await statsRes.json();
	let videoStatistics = {};

	(Array.isArray(videoStats.items) ? videoStats.items : []).forEach((item) => {
		videoStatistics[item.id] = item.statistics.viewCount;
	});

	let videoLists = {
		nextPageToken: nextPageToken,
		numberOfPages: numberOfPages,
		videos: videos,
		videoStats: videoStatistics,
	};

	return { videoLists };
};

export const getOptHomeImages = async () => {
	const items = tafseers.slice(3, 6);
	return filterTafseers(items);
};

export const getOptHomeBlogs = async () => {
	const items = tafseers.slice(0, 4);
	return filterTafseers(items);
};

const quotes = [
	{
		id: 1,
		image: "/img/slider/01.jpg",
		text: "The life of this world is merely enjoyment of delusion",
		author: "Quran 3:185",
	},
	{
		id: 2,
		image: "/img/slider/02.jpg",
		text: "Indeed, the patient will be given their reward without account",
		author: "Quran 39:10",
	},
	{
		id: 3,
		image: "/img/slider/03.jpg",
		text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me",
		author: "Quran 02:152",
	},
];

export const getOptHomeQuotes = async () => {
	const items = quotes.slice(0, 3);
	return items;
};

export const getOptHomeBooks = async () => {
	const items = books.filter((item) => item.opt_home === "1");
	return filterBooks(items);
};

export const getHome3Posts4 = async () => {
	const items = tafseers.slice(0, 4);
	return filterTafseers(items);
};

// Helper to clean and validate text content
const isValidTextContent = (text) => {
	if (!text) return false;
	if (typeof text !== 'string') return false;
	
	let cleaned = text.trim();
	
	// Remove HTML tags
	cleaned = cleaned.replace(/<[^>]*>/g, "").trim();
	
	// Filter out null/undefined/empty strings
	if (cleaned.length === 0) return false;
	if (cleaned.toLowerCase() === "null" || cleaned.toLowerCase() === "undefined") return false;
	if (cleaned === "-" || cleaned === "N/A" || cleaned === "") return false;
	
	// Filter out bare URLs without description
	if (/^https?:\/\/.+$/.test(cleaned)) return false;
	
	// Must have actual content (at least 3 characters of real text)
	return cleaned.length >= 3;
};

const isAnswerTitleOnly = (item) => {
	if (!item) return false;

	const answer = (item.answer || "").trim();
	const question = (item.question || item.title || "").trim();
	const content = (item.content || "").trim();

	// If answer is empty or same as question/title, it's title-only
	if (!answer || answer === question || answer === content) return true;

	// Check if answer is just a variation of the title (case-insensitive, with extra punctuation allowed)
	const answerLower = answer.toLowerCase();
	const questionLower = question.toLowerCase();
	
	// Allow for minor differences like punctuation/dots
	const answerNorm = answerLower.replace(/[.,!?;:\s]+/g, "");
	const questionNorm = questionLower.replace(/[.,!?;:\s]+/g, "");
	
	if (answerNorm === questionNorm) return true;

	return false;
};

const hasMediaContent = (item) => {
	if (!item) return false;

	const rawAnswer = `${item.answer || ""}
${item.content || ""}`.toLowerCase();

	if (item.has_video === true) return true;
	if (item.video_count && item.video_count > 0) return true;
	if (item.video_url || item.embed_url || item.video) return true;
	if (Array.isArray(item.youtube_videos) && item.youtube_videos.length > 0) return true;
	if (/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(rawAnswer)) return true;
	if (rawAnswer.includes("<iframe") || rawAnswer.includes("<video") || rawAnswer.includes("<source")) return true;

	if (item.audio_url) return true;
	if (Array.isArray(item.audio_files) && item.audio_files.length > 0) return true;
	if (rawAnswer.includes("<audio") || rawAnswer.includes("audio-player")) return true;

	if (Array.isArray(item.pdf_files) && item.pdf_files.length > 0) return true;

	return false;
};

const normalizeAnswerBody = (value, questionText = "") => {
	if (!value || typeof value !== 'string') return "";

	let cleaned = value
		.replace(/https?:\/\/[^\s'"<>]+/gi, "")
		.replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
		.replace(/<video[\s\S]*?<\/video>/gi, " ")
		.replace(/<audio[\s\S]*?<\/audio>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/[\t\r\n]+/g, " ")
		.replace(/\s{2,}/g, " ")
		.trim();

	if (questionText && typeof questionText === 'string') {
		const qEsc = questionText.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		if (qEsc) {
			cleaned = cleaned.replace(new RegExp(qEsc, 'gi'), '').trim();
		}
	}

	return cleaned;
};

const hasRenderableAnswerText = (item) => {
	if (!item) return false;
	const answer = item.answer || item.content;
	const normalized = normalizeAnswerBody(answer, item.question || item.title || "");
	return isValidTextContent(normalized);
};

// Helper function to check if QNA item has valid answer content (STRICT MODE)
const hasValidAnswerStrict = (item) => {
	return hasValidAnswer(item);
};

// Helper function to check if QNA item has valid answer content (LENIENT MODE)
const hasValidAnswer = (item) => {
	if (!item) return false;

	// Reject if answer is just the title/question
	if (isAnswerTitleOnly(item)) {
		// Unless it has actual media content
		const hasMedia = hasMediaContent(item);
		if (!hasMedia) return false;
	}

	const answer = item.answer || item.content;
	const hasText = isValidTextContent(answer);
	const hasMedia = hasMediaContent(item);

	return hasText || hasMedia;
};

export const qaFetcher = async (...args) => {
	return await getAllQuestions(JSON.parse(args));
};

export const getAllQuestions = async (obj) => {
	let currentPage = obj.currentPage || 1;
	let cat_slug = normalizeCategorySlug(obj.cat_slug || "all") || "all";
	let maxResult = obj.pageSize || constants.DEFAULT_PAGE_LIMIT || 50; // Use pageSize if provided
	let strictFilter = obj.strictFilter !== false;

	// Filter raw data FIRST (before normalization) to reduce processing
	let filteredRawData = [];
	if (cat_slug == "all") {
		filteredRawData = loadQnaData().qna;
	} else {
		filteredRawData = loadQnaData().qna.filter(
			(item) => {
				const itemSlug = normalizeCategorySlug(item.category_slug || item.cat_slug || item.categories?.[0]);
				return itemSlug === cat_slug;
			}
		);
	}

	// Keep items with meaningful text or media content.
	const filterFunction = hasValidAnswer;
	filteredRawData = filteredRawData.filter(filterFunction);

	const totalItems = filteredRawData.length;
	const numberOfPages = Math.ceil(totalItems / maxResult);

	// Calculate pagination indices
	let index, offSet;
	if (currentPage == 1 || currentPage <= 0) {
		index = 0;
		offSet = maxResult;
	} else if (currentPage > numberOfPages) {
		index = (numberOfPages - 1) * maxResult;
		offSet = totalItems;
	} else {
		index = (currentPage - 1) * maxResult;
		offSet = Math.min(index + maxResult, totalItems);
	}

	// SLICE FIRST, then normalize only the needed items
	const slicedRawItems = filteredRawData.slice(index, offSet);
	const qaItems = slicedRawItems.map(normalizeQna).filter(Boolean);

	return { qaItems, numberOfPages, currentPage };
};

export const getAllArticles = async (obj) => {
	let currentPage = obj.currentPage || 1;
	let search = (obj.search || "").toString().trim().toLowerCase();
	let pageSize = obj.pageSize || constants.DEFAULT_PAGE_LIMIT || 9;

	// Filter raw data first
	let filtered = articles.filter(item => {
		if (!item) return false;
		if (!item.title && !item.description && !item.postTitle) return false;
		if (!search) return true;
		const title = (item.title || item.postTitle || "").toString().toLowerCase();
		const desc = (item.description || item.excerpt || item.postExcerpt || "").toString().toLowerCase();
		return title.includes(search) || desc.includes(search);
	});

	const totalItems = filtered.length;
	const numberOfPages = Math.max(1, Math.ceil(totalItems / pageSize));

	// Calculate slice
	let index = 0;
	let offSet = pageSize;
	if (currentPage <= 1) {
		index = 0;
		offSet = pageSize;
	} else if (currentPage > numberOfPages) {
		index = (numberOfPages - 1) * pageSize;
		offSet = totalItems;
	} else {
		index = (currentPage - 1) * pageSize;
		offSet = Math.min(index + pageSize, totalItems);
	}

	const sliced = filtered.slice(index, offSet);
	const articleItems = sliced.map(normalizeArticle).filter(Boolean);

	return { articleItems, numberOfPages, currentPage };
};
export const getQnaByLimit = async (num) => {
	if (num && num > 0) {
		return loadQnaData().qna.filter(hasValidAnswer).slice(0, num).map(normalizeQna).filter(Boolean);
	} else return loadQnaData().qna.filter(hasValidAnswer).slice(0, constants.GENERATED_ANS_PAGE).map(normalizeQna).filter(Boolean);
};

export const getQnCatTitle = async (param) => {
	if (param !== "all") {
		const items = loadQnaData().qnCat.filter((item) => item.slug === param);
		return items.length > 0 ? items[0].title : "";
	} else return "All Questions";
};

export const getAnsById = async (id) => {
	return loadQnaData().qna.filter((item) => item.id == id && hasValidAnswer(item)).map(normalizeQna).filter(Boolean);
};

export const getAllQnaCategory = async () => {
	let allQnCat = [
		{
			id: 0,
			title: "All Questions",
			slug: "all",
		},
	];
	allQnCat.push(...loadQnaData().qnCat);
	return allQnCat;
};
// Homepage Q&A figures: answered-question total and the most answered topics.
// Counts use the same primary-category slug as the /qna/[slug] listing.
const HOME_TOPIC_EXCLUDE = ["other", "women-clothing"];

export const getQnaOverview = async (topicLimit = 6) => {
	const { qna, qnCat } = loadQnaData();
	const counts = {};
	let totalAnswers = 0;

	qna.forEach((item) => {
		if (!hasValidAnswer(item)) return;
		totalAnswers += 1;
		const slug = normalizeCategorySlug(item.category_slug || item.cat_slug || item.categories?.[0]);
		if (slug) counts[slug] = (counts[slug] || 0) + 1;
	});

	const topTopics = qnCat
		.filter((cat) => counts[cat.slug] && !HOME_TOPIC_EXCLUDE.includes(cat.slug))
		.map((cat) => ({ title: cat.title, slug: cat.slug, count: counts[cat.slug] }))
		.sort((a, b) => b.count - a.count)
		.slice(0, topicLimit);

	return { totalAnswers, totalTopics: qnCat.length, topTopics };
};
