FROM node:12

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y default-jre

# Only bring the package information to allow for better layer caching for npm install
COPY package*.json ./
COPY .npmrc ./
RUN npm install

# bring the rest
COPY . .

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
