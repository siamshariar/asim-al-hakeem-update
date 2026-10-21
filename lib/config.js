export const server =
	!process.env.NODE_ENV || process.env.NODE_ENV === "development"
		? "http://localhost:3000"
		: "https://asim-al-hakeem-web.vercel.app"; // no trailing slash: pages build URLs as `${server}/path`

export const youtubeKeys = {
	key1: "AIzaSyChzEG128powzr7XBWDIo5dK0_Zqvgr5Do",
	key7: "AIzaSyDUCJuapfrKsBgFdDjdpAEUvAG3VvogmXo",
	key2: "AIzaSyADJS1U8lXxlXKSlnZ1BY4WND_t-qR2Sjo",
	key3: "AIzaSyBRBEGzZBcosd6-71S_86Q-avOWTEDRxKg",
	key4: "AIzaSyDR2BjErw_CLIZPYJOcAH5OwUQVQxfPV6A",
	key5: "AIzaSyC61nTv7iAPinxgUBP1f1TfVGoHGgmmtmc",
	key6: "AIzaSyCcD0RPJcjiFjjmkWJWqVF-jrkjXrX8u3Y",
	key7: "AIzaSyCmY64IKmZx_7UxhhEBaEpapDvU90PiMmw",
	key8: "AIzaSyDIYF2hEb27kNrrrHpM0v1Kime7M1wVTjw"
};

export const youtube = {
	url: "https://www.googleapis.com/youtube/v3",
	key: youtubeKeys.key7,

	// dr-monzur-e-elahi
	// channelID: 'UCbMys3ID_1S8D1mZuYkoG2A',
	// uploadPlaylistID: 'UUbMys3ID_1S8D1mZuYkoG2A',

	// dr-abubakr-zakaria
	// channelID: "UCsdrsrt-_eB_x3R85GVqwVQ",A
	// uploadPlaylistID: "UUsdrsrt-_eB_x3R85GVqwVQ",

	// Sheikh Assim Alhakeem
	channelID: "UCWsdcrre0WbCWML_PnuzoAg",
   uploadPlaylistID: "UUWsdcrre0WbCWML_PnuzoAg",

};

export const constants = {
	DEFAULT_PAGE_LIMIT: 12,
	MAX_YOUTUBE_PAGE_LIMIT: 50,
	YOUTUBE_RELATED_VIDEOS_PAGE_LIMIT: 4,
	YOUTUBE_HOME_PAGE_RECENT_VIDEOS: 6,
	GENERATED_ANS_PAGE: 50,
};
export const receiverEmail = "md.rakibul.dit.int@gmail.com";
export const emailSenderName = "DIT Web Client";
