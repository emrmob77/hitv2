import { Client } from '@elastic/elasticsearch';

// Elasticsearch client configuration
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_API_KEY
    ? {
        apiKey: process.env.ELASTICSEARCH_API_KEY,
      }
    : undefined,
});

export interface SearchDocument {
  id: string;
  type: 'bookmark' | 'collection' | 'post' | 'user' | 'tag';
  title: string;
  content?: string;
  description?: string;
  tags?: string[];
  user_id?: string;
  username?: string;
  url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchOptions {
  query: string;
  types?: Array<'bookmark' | 'collection' | 'post' | 'user' | 'tag'>;
  filters?: {
    user_id?: string;
    tags?: string[];
    is_public?: boolean;
    date_from?: string;
    date_to?: string;
  };
  page?: number;
  limit?: number;
  sort?: 'relevance' | 'date' | 'popularity';
}

export interface SearchResult {
  documents: Array<SearchDocument & { score: number; highlights?: any }>;
  total: number;
  page: number;
  limit: number;
  took_ms: number;
}

/**
 * Elasticsearch Full-Text Search Engine
 */
export class ElasticsearchService {
  private readonly indexPrefix = 'hitv2';

  /**
   * Initialize Elasticsearch indexes
   */
  async initializeIndexes(): Promise<void> {
    const indexes = ['bookmarks', 'collections', 'posts', 'users', 'tags'];

    for (const indexName of indexes) {
      const fullIndexName = `${this.indexPrefix}_${indexName}`;

      const exists = await esClient.indices.exists({ index: fullIndexName });

      if (!exists) {
        await esClient.indices.create({
          index: fullIndexName,
          body: this.getIndexMapping(indexName),
        });
      }
    }
  }

  /**
   * Get index mapping for different entity types
   */
  private getIndexMapping(indexName: string): any {
    const baseMapping = {
      settings: {
        analysis: {
          analyzer: {
            custom_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'stop', 'snowball'],
            },
          },
        },
        number_of_shards: 1,
        number_of_replicas: 1,
      },
      mappings: {
        properties: {
          id: { type: 'keyword' },
          type: { type: 'keyword' },
          title: {
            type: 'text',
            analyzer: 'custom_analyzer',
            fields: {
              keyword: { type: 'keyword' },
            },
          },
          content: {
            type: 'text',
            analyzer: 'custom_analyzer',
          },
          description: {
            type: 'text',
            analyzer: 'custom_analyzer',
          },
          tags: { type: 'keyword' },
          user_id: { type: 'keyword' },
          username: {
            type: 'text',
            fields: {
              keyword: { type: 'keyword' },
            },
          },
          url: { type: 'keyword' },
          is_public: { type: 'boolean' },
          created_at: { type: 'date' },
          updated_at: { type: 'date' },
        },
      },
    };

    return baseMapping;
  }

  /**
   * Index a document
   */
  async indexDocument(document: SearchDocument): Promise<void> {
    const indexName = `${this.indexPrefix}_${document.type}s`;

    await esClient.index({
      index: indexName,
      id: document.id,
      document,
    });
  }

  /**
   * Bulk index documents
   */
  async bulkIndexDocuments(documents: SearchDocument[]): Promise<void> {
    const operations = documents.flatMap((doc) => [
      { index: { _index: `${this.indexPrefix}_${doc.type}s`, _id: doc.id } },
      doc,
    ]);

    await esClient.bulk({ operations });
  }

  /**
   * Delete a document from index
   */
  async deleteDocument(id: string, type: string): Promise<void> {
    const indexName = `${this.indexPrefix}_${type}s`;

    await esClient.delete({
      index: indexName,
      id,
    });
  }

  /**
   * Search across indexes
   */
  async search(options: SearchOptions): Promise<SearchResult> {
    const {
      query,
      types = ['bookmark', 'collection', 'post', 'user', 'tag'],
      filters = {},
      page = 1,
      limit = 20,
      sort = 'relevance',
    } = options;

    const indexes = types.map((type) => `${this.indexPrefix}_${type}s`);

    // Build query
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^3', 'content^2', 'description', 'tags^2', 'username'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      },
    ];

    // Add filters
    const filter: any[] = [];

    if (filters.user_id) {
      filter.push({ term: { user_id: filters.user_id } });
    }

    if (filters.tags && filters.tags.length > 0) {
      filter.push({ terms: { tags: filters.tags } });
    }

    if (filters.is_public !== undefined) {
      filter.push({ term: { is_public: filters.is_public } });
    }

    if (filters.date_from || filters.date_to) {
      const range: any = {};
      if (filters.date_from) range.gte = filters.date_from;
      if (filters.date_to) range.lte = filters.date_to;
      filter.push({ range: { created_at: range } });
    }

    // Build sort
    let sortClause: any[];
    switch (sort) {
      case 'date':
        sortClause = [{ created_at: { order: 'desc' } }];
        break;
      case 'popularity':
        sortClause = [{ _score: { order: 'desc' } }, { created_at: { order: 'desc' } }];
        break;
      default: // relevance
        sortClause = [{ _score: { order: 'desc' } }];
    }

    const from = (page - 1) * limit;

    const result = await esClient.search({
      index: indexes,
      from,
      size: limit,
      body: {
        query: {
          bool: {
            must,
            filter: filter.length > 0 ? filter : undefined,
          },
        },
        sort: sortClause,
        highlight: {
          fields: {
            title: {},
            content: {},
            description: {},
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
        },
      },
    });

    const documents = result.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
      highlights: hit.highlight,
    }));

    return {
      documents,
      total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0,
      page,
      limit,
      took_ms: result.took,
    };
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(prefix: string, limit: number = 10): Promise<string[]> {
    const result = await esClient.search({
      index: `${this.indexPrefix}_*`,
      size: limit,
      body: {
        suggest: {
          title_suggest: {
            prefix,
            completion: {
              field: 'title.keyword',
              size: limit,
              skip_duplicates: true,
            },
          },
        },
      },
    });

    const suggestions =
      result.suggest?.title_suggest?.[0]?.options?.map((option: any) => option.text) || [];

    return suggestions;
  }

  /**
   * Get similar documents (More Like This)
   */
  async getSimilarDocuments(
    documentId: string,
    type: string,
    limit: number = 5
  ): Promise<SearchDocument[]> {
    const indexName = `${this.indexPrefix}_${type}s`;

    const result = await esClient.search({
      index: indexName,
      size: limit,
      body: {
        query: {
          more_like_this: {
            fields: ['title', 'content', 'description', 'tags'],
            like: [
              {
                _index: indexName,
                _id: documentId,
              },
            ],
            min_term_freq: 1,
            max_query_terms: 12,
          },
        },
      },
    });

    return result.hits.hits.map((hit: any) => hit._source);
  }

  /**
   * Check if Elasticsearch is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await esClient.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const elasticsearchService = new ElasticsearchService();
