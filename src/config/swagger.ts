export const createOpenAPIDoc = () => {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Personal Budget Tracker API',
      version: 'v1',
      description: 'API for tracking personal budget, income, and expenses'
    },
    paths: {
      // Authentication paths
      '/api/users/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User registered successfully'
            },
            '400': {
              description: 'Bad request'
            }
          }
        }
      },
      '/api/users/login': {
        post: {
          summary: 'Login a user',
          tags: ['Authentication'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful'
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        }
      },
      '/api/users/profile': {
        get: {
          summary: 'Get user profile',
          tags: ['Authentication'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            '200': {
              description: 'User profile'
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        }
      },
      
      // Category paths
      '/api/categories': {
        post: {
          summary: 'Create a new category',
          tags: ['Categories'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['income', 'expense'] }
                  },
                  required: ['name', 'type']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Category created successfully'
            },
            '400': {
              description: 'Bad request'
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        },
        get: {
          summary: 'Get all categories',
          tags: ['Categories'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['income', 'expense']
              },
              description: 'Filter categories by type'
            }
          ],
          responses: {
            '200': {
              description: 'List of categories'
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        }
      },
      '/api/categories/{id}': {
        get: {
          summary: 'Get a category by ID',
          tags: ['Categories'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              },
              description: 'Category ID'
            }
          ],
          responses: {
            '200': {
              description: 'Category details'
            },
            '401': {
              description: 'Unauthorized'
            },
            '404': {
              description: 'Category not found'
            }
          }
        },
        put: {
          summary: 'Update a category',
          tags: ['Categories'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              },
              description: 'Category ID'
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['income', 'expense'] }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Category updated successfully'
            },
            '400': {
              description: 'Bad request'
            },
            '401': {
              description: 'Unauthorized'
            },
            '404': {
              description: 'Category not found'
            }
          }
        },
        delete: {
          summary: 'Delete a category',
          tags: ['Categories'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              },
              description: 'Category ID'
            }
          ],
          responses: {
            '200': {
              description: 'Category deleted successfully'
            },
            '401': {
              description: 'Unauthorized'
            },
            '404': {
              description: 'Category not found'
            }
          }
        }
      },
      
      // Transaction paths
      '/api/transactions': {
        post: {
          summary: 'Create a new transaction',
          tags: ['Transactions'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number', format: 'float', minimum: 0 },
                    description: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    type: { type: 'string', enum: ['income', 'expense'] },
                    categoryId: { type: 'integer' }
                  },
                  required: ['amount', 'date', 'type']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Transaction created successfully'
            },
            '400': {
              description: 'Bad request'
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        },
        get: {
          summary: 'Get all transactions',
          tags: ['Transactions'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['income', 'expense']
              },
              description: 'Filter transactions by type'
            },
            {
              name: 'categoryId',
              in: 'query',
              schema: {
                type: 'integer'
              },
              description: 'Filter transactions by category ID'
            },
            {
              name: 'startDate',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: 'Filter transactions by start date (inclusive)'
            },
            {
              name: 'endDate',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: 'Filter transactions by end date (inclusive)'
            },
            {
              name: 'minAmount',
              in: 'query',
              schema: {
                type: 'number',
                format: 'float'
              },
              description: 'Filter transactions by minimum amount'
            },
            {
              name: 'maxAmount',
              in: 'query',
              schema: {
                type: 'number',
                format: 'float'
              },
              description: 'Filter transactions by maximum amount'
            },
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1,
                minimum: 1
              },
              description: 'Page number for pagination'
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10,
                minimum: 1,
                maximum: 100
              },
              description: 'Number of items per page'
            },
            {
              name: 'sortBy',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['date', 'amount'],
                default: 'date'
              },
              description: 'Field to sort by'
            },
            {
              name: 'sortOrder',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
              },
              description: 'Sort order (ascending or descending)'
            }
          ],
          responses: {
            '200': {
              description: 'List of transactions with pagination',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      transactions: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            amount: { type: 'number' },
                            description: { type: 'string' },
                            date: { type: 'string', format: 'date-time' },
                            type: { type: 'string', enum: ['income', 'expense'] },
                            categoryId: { type: 'integer' },
                            userId: { type: 'integer' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                          }
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          totalPages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        }
      },
      '/api/transactions/summary': {
        get: {
          summary: 'Get transaction summary',
          tags: ['Transactions'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'startDate',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: 'Start date for summary period (inclusive)'
            },
            {
              name: 'endDate',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: 'End date for summary period (inclusive)'
            }
          ],
          responses: {
            '200': {
              description: 'Transaction summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      summary: {
                        type: 'object',
                        properties: {
                          totalIncome: { type: 'number' },
                          totalExpense: { type: 'number' },
                          balance: { type: 'number' },
                          period: {
                            type: 'object',
                            properties: {
                              startDate: { type: 'string' },
                              endDate: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        }
      },
      '/api/transactions/{id}': {
        get: {
          summary: 'Get a transaction by ID',
          tags: ['Transactions'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              },
              description: 'Transaction ID'
            }
          ],
          responses: {
            '200': {
              description: 'Transaction details'
            },
            '401': {
              description: 'Unauthorized'
            },
            '404': {
              description: 'Transaction not found'
            }
          }
        },
        put: {
          summary: 'Update a transaction',
          tags: ['Transactions'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              },
              description: 'Transaction ID'
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number', format: 'float', minimum: 0 },
                    description: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    type: { type: 'string', enum: ['income', 'expense'] },
                    categoryId: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Transaction updated successfully'
            },
            '400': {
              description: 'Bad request'
            },
            '401': {
              description: 'Unauthorized'
            },
            '404': {
              description: 'Transaction not found'
            }
          }
        },
        delete: {
          summary: 'Delete a transaction',
          tags: ['Transactions'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              },
              description: 'Transaction ID'
            }
          ],
          responses: {
            '200': {
              description: 'Transaction deleted successfully'
            },
            '401': {
              description: 'Unauthorized'
            },
            '404': {
              description: 'Transaction not found'
            }
          }
        }
      },
      // Add this to the paths object in your existing swagger.ts file

'/api/budgets': {
  post: {
    summary: 'Create a new budget',
    tags: ['Budgets'],
    security: [
      {
        bearerAuth: []
      }
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              amount: { type: 'number', format: 'float', minimum: 0 },
              month: { type: 'integer', minimum: 1, maximum: 12 },
              year: { type: 'integer', minimum: 2000, maximum: 2100 },
              categoryId: { type: 'integer' }
            },
            required: ['amount', 'month', 'year']
          }
        }
      }
    },
    responses: {
      '201': {
        description: 'Budget created successfully'
      },
      '400': {
        description: 'Bad request'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  get: {
    summary: 'Get all budgets',
    tags: ['Budgets'],
    security: [
      {
        bearerAuth: []
      }
    ],
    parameters: [
      {
        name: 'month',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 12
        },
        description: 'Filter budgets by month'
      },
      {
        name: 'year',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 2000,
          maximum: 2100
        },
        description: 'Filter budgets by year'
      },
      {
        name: 'categoryId',
        in: 'query',
        schema: {
          type: 'integer'
        },
        description: 'Filter budgets by category ID'
      }
    ],
    responses: {
      '200': {
        description: 'List of budgets'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  }
},
'/api/budgets/vs-actual': {
  get: {
    summary: 'Get budget vs actual spending',
    tags: ['Budgets'],
    security: [
      {
        bearerAuth: []
      }
    ],
    parameters: [
      {
        name: 'month',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 12
        },
        description: 'Month for budget comparison (defaults to current month)'
      },
      {
        name: 'year',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 2000,
          maximum: 2100
        },
        description: 'Year for budget comparison (defaults to current year)'
      }
    ],
    responses: {
      '200': {
        description: 'Budget vs actual spending comparison',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                month: { type: 'integer' },
                year: { type: 'integer' },
                totalBudget: { type: 'number' },
                totalSpent: { type: 'number' },
                remaining: { type: 'number' },
                percentUsed: { type: 'number' },
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      budgetId: { type: 'integer' },
                      categoryId: { type: 'integer' },
                      budgetAmount: { type: 'number' },
                      actualAmount: { type: 'number' },
                      difference: { type: 'number' },
                      percentUsed: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  }
},
'/api/budgets/{id}': {
  get: {
    summary: 'Get a budget by ID',
    tags: ['Budgets'],
    security: [
      {
        bearerAuth: []
      }
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer'
        },
        description: 'Budget ID'
      }
    ],
    responses: {
      '200': {
        description: 'Budget details'
      },
      '401': {
        description: 'Unauthorized'
      },
      '404': {
        description: 'Budget not found'
      }
    }
  },
  put: {
    summary: 'Update a budget',
    tags: ['Budgets'],
    security: [
      {
        bearerAuth: []
      }
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer'
        },
        description: 'Budget ID'
      }
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              amount: { type: 'number', format: 'float', minimum: 0 },
              month: { type: 'integer', minimum: 1, maximum: 12 },
              year: { type: 'integer', minimum: 2000, maximum: 2100 },
              categoryId: { type: 'integer' }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Budget updated successfully'
      },
      '400': {
        description: 'Bad request'
      },
      '401': {
        description: 'Unauthorized'
      },
      '404': {
        description: 'Budget not found'
      }
    }
  },
  delete: {
    summary: 'Delete a budget',
    tags: ['Budgets'],
    security: [
      {
        bearerAuth: []
      }
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer'
        },
        description: 'Budget ID'
      }
    ],
    responses: {
      '200': {
        description: 'Budget deleted successfully'
      },
      '401': {
        description: 'Unauthorized'
      },
      '404': {
        description: 'Budget not found'
      }
    }
  }
}
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  };
};