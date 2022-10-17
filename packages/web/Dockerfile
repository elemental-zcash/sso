#Creates a layer from node:alpine image.
FROM node:alpine

#Creates directories
RUN mkdir -p /usr/src/app

RUN apk add --update --no-cache python3 make g++\
   && rm -rf /var/cache/apk/*

# COPY start.sh /usr/src/app
# COPY build.sh /usr/src/app
# RUN chmod +x /usr/src/app/start.sh /usr/src/app/build.sh

#Sets an environment variable
ENV PORT 3000

#Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD commands
WORKDIR /usr/src/app

# RUN chmod +x build.sh

#Copy new files or directories into the filesystem of the container
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

#Execute commands in a new layer on top of the current image and commit the results
RUN npm install

##Copy new files or directories into the filesystem of the container
COPY . /usr/src/app

#Execute commands in a new layer on top of the current image and commit the results
# RUN npm run build
RUN chmod 755 build.sh && /usr/src/app/build.sh
RUN chmod 755 start.sh

#Informs container runtime that the container listens on the specified network ports at runtime
EXPOSE 3000

#Allows you to configure a container that will run as an executable
ENTRYPOINT ["/usr/src/app/start.sh"]

# # 1. Install dependencies only when needed
# FROM node:16-alpine AS deps
# # Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat

# WORKDIR /app

# # Install dependencies based on the preferred package manager
# COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# RUN \
#   if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
#   elif [ -f package-lock.json ]; then npm ci; \
#   elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
#   else echo "Lockfile not found." && exit 1; \
#   fi


# # 2. Rebuild the source code only when needed
# FROM node:16-alpine AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# # This will do the trick, use the corresponding env file for each environment.
# COPY .env.production .env.production
# RUN yarn build

# # 3. Production image, copy all the files and run next
# FROM node:16-alpine AS runner
# WORKDIR /app

# ENV NODE_ENV=production

# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001

# COPY --from=builder /app/public ./public

# # Automatically leverage output traces to reduce image size
# # https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


# USER nextjs

# EXPOSE 3000

# ENV PORT 3000

# CMD ["node", "server.js"]