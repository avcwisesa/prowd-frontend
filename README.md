# ProWD Front End
The front-end service of [ProWD](http://prowd.id) is used to query Wikidata, profile thedata, and generate visualizations.


## Prerequisites & Setup

- Linux machine with root access
- Node.js - [Node.js installation](https://nodejs.org/en/)

```
git clone https://github.com/avcwisesa/prowd-frontend
```

## Running the code

### Running development version

1. Install dependencies
```
npm install
```
2. Run development server with hot-reload
```
npm run serve
```

### Production
1. Install dependencies
```
npm install
```
2. Create production build
```
npm run build
```

## Development guide

### Libraries

- [Vue.js](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/en/)
- [Axios](https://github.com/axios/axios)

### Features

- Refer to Vue.js docs for page templating, general development and Vuetify docs for UI components
- To modify a page/feature please refer to this [router code](https://github.com/avcwisesa/prowd-frontend/blob/master/src/router/index.js) to find which file you have to modify. E.g., To modify ProWD.id/about modify [this code](https://github.com/avcwisesa/prowd-frontend/blob/master/src/components/About.vue)
