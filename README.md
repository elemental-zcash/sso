# sso
Elemental Zcash SSO OAuth2 server

## Getting Started

```sh
git clone #...
docker network create -d bridge elemental_sso
docker network create -d bridge sso_next_net
```

```sh
# CLIENT_SECRET --- echo $(openssl rand -base64 72 -out /dev/stdout | sed -r 's/[^a-zA-Z0-9]//g' | tr -d '\n')
```

**DKIM Setup**

```sh
openssl genrsa -out private.key 2048 # Used by elemental-mail/nodemailer to sign each email
openssl rsa -in private.key -pubout -out public.key # Published in DKIM TXT DNS record
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
- https://www.apollographql.com/blog/backend/architecture/how-to-structure-graphql-server-code/#.w8djt4dyf
- https://www.apollographql.com/blog/community/backend/graphql-at-facebook-by-dan-schafer/
- 
- https://github.com/spruceid/siwe-quickstart/blob/main/03_complete_app/backend/src/index.js
- Sign-in With Ethereum – https://login.xyz/
- 
- https://nhost.io/product/auth
- 
- https://app.postdrop.io/ - email HTML (for React templating?)
- 
- VERIFYING EMAILS: https://designmodo.com/verification-emails/
- 

**OAuth2**

- https://github.com/curityio/react-haapi-demo/blob/master/src/components/OidcClient.js
- https://github.com/curityio/react-haapi-demo/blob/master/src/components/HAAPIProcessor.js
- 
- 

Docker cron - https://levelup.gitconnected.com/cron-docker-the-easiest-job-scheduler-youll-ever-create-e1753eb5ea44
https://github.com/mcuadros/ofelia

## Python Server



```sh
pip freeze > requirements.txt
```

```bash
pip install -r requirements.txt 
```
