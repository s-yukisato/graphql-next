import { gql, ApolloServer } from "apollo-server-micro";
import { PrismaClient } from "@prisma/client";
import Cors from "micro-cors";

const prisma = new PrismaClient();

const typeDefs = gql`
  type BlogPost {
    id: String
    text: String
  }

  type Query {
    blogPosts: [BlogPost]
  }

  type Mutation {
    addBlogPost(text: String): BlogPost
    editBlogPost(id: String, text: String): BlogPost
    deleteBlogPost(id: String): BlogPost
  }
`;

const resolvers = {
  Query: {
    blogPosts: (_parent, _args, _context) => {
      return prisma.blogPost.findMany()
    }
  },

  Mutation: {
    addBlogPost: (_parent, { text }, _context) => {
      return prisma.blogPost.create({ data: { text } })
    },
    editBlogPost: (_parent, { id, text }, _context) => {
      return prisma.blogPost.update({ where: { id }, data: { text } })
    },
    deleteBlogPost: (_parent, { id }, _context) => {
      return prisma.blogPost.delete({ where: { id } })
    }
  }
};


export const config = {
  api: {
    bodyParser: false,
  },
};

const cors = Cors();

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const startServer = server.start();

export default cors(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;
  await server.createHandler({ path: "/api/graphql" })(req, res);
});

