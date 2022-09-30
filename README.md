# sso
Elemental Zcash SSO OAuth2 server

## Getting Started

```sh
git clone #...
```

### Requirements

- Docker (Docker Desktop or Docker Engine)
- mkcert (for local development, or can disable nginx HTTPS in docker-compose)
  - Please be aware of the security risks of using custom root CAs. They should never leave, or be used outside of a dev machine.
  - `brew install mkcert`
  - `mkcert -install`


### Local HTTPS Setup

```sh
HOST=elemental-sso.local
mkdir certs
mkcert -cert-file certs/$HOST.crt -key-file certs/$HOST.key $HOST
```

### Running the Servers

```sh
npm run start:local # alias for the docker-compose script
```

## Resources

- https://www.howtographql.com/graphql-js/6-authentication/
- https://www.digitalocean.com/community/tutorials/how-to-build-a-graphql-api-with-golang-to-upload-files-to-digitalocean-spaces
- https://github.com/thebergamo/realworld-graphql/blob/master/src/resources/users/resolver.js
- https://www.toptal.com/graphql/creating-your-first-graphql-api
- https://devdocs.magento.com/guides/v2.4/graphql/mutations/create-customer.html
- 
- 
- https://app.postdrop.io/ - email HTML (for React templating?)