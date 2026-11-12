export const KeywordObjectType = {
  App_Domain_Common_Entities_Keywords_Keyword: 'App\\Domain\\Common\\Entities\\Keywords\\Keyword',
};

export const KeywordObjectTypeStrict = {
  App_Domain_Common_Entities_Keywords_Keyword: 'App\\Domain\\Common\\Entities\\Keywords\\Keyword',
} as const;

export type Keyword = {
  /**
   * The alias for the keyword
   */
  alias?: string | null;
  /**
   * The hashed value of the keyword name
   */
  hash?: string | null;
  /**
   * The keyword name
   *
   * The authoritative length rules live in SetupService::cleanDedupeAndLengthPartitionKeywordNames().
   * min is relaxed to 1 here to admit single-character Japanese keywords; the constraint fires
   * unreliably via repo-update validation and is not the primary enforcement point.
   */
  name?: string | null;
  /**
   * For keywords statistics
   */
  statisticsValue?: number | null;
  /**
   * For keywords statistics
   */
  statisticsThreshold?: number | null;
  /**
   * The fully qualified class name of the object
   */
  objectType: (typeof KeywordObjectType)[keyof typeof KeywordObjectType] | null;
  /**
   * The internal identifier of the entity
   */
  id?: number | null;
};
