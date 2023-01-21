export interface ArrangeMovie {
	response: {
		movieImage: string;
		movieTitle: string;
		description: string;
		movieGenre: string;
		movieLabel: string;
		movieShowTime: string;
		movieReleaseTime: string;
		voteRating: string;
		voteNumber: string;
		feedback: Array<FeedbackEntity>;
		casts: Array<Cast>;
		crew: Array<CrewMember>;
	};
}

export interface CrewMember {
	crewImage: string;
	crewDesignation: string;
	crewName: string;
}

export interface MovieDetails {
	genre: string;
	label: string;
	time: string;
	release: string;
}

export interface Votes {
	rating: string;
	votes: string;
}

export interface Casts {
	castImage: Array<string>;
	castDesignation: Array<string>;
	castName: Array<string>;
}

export interface Cast {
	castImage: string;
	castDesignation: string;
	castName: string;
}

export interface Crew {
	crewImage: Array<string>;
	crewDesignation: Array<string>;
	crewName: Array<string>;
}

export interface Feedback {
	hashTags: Array<string>;
	feedback: Array<string>;
	rating: Array<string>;
	userImages: Array<string>;
	userNames: Array<string>;
}

export interface FeedbackEntity {
	feedback: string;
	hashTags: string;
	rating: string;
	userImages: string;
	userNames: string;
}
