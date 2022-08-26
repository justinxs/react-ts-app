import staticResource from "./staticResource.js";

export default function plugins(fastify) {
  staticResource(fastify);
}