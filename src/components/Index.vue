<template>
  <v-container class="pt-1">
    <v-layout row justify-space-around class="mt-4">
      <v-flex xs3>
        <img src="@/assets/search-512.png" style="width: 40%"/>
      </v-flex>
      <v-flex xs3>
        <img src="@/assets/single-512.png" style="width: 40%"/>
      </v-flex>
      <v-flex xs3>
        <img src="@/assets/compare-512.png" style="width: 40%"/>
      </v-flex>
      <v-flex xs3>
        <img src="@/assets/mda-512.png" style="width: 40%"/>
      </v-flex>
    </v-layout>
    <v-layout row justify-space-around>
      <v-flex xs3>
        <v-card-text class="text-xs-center">{{ searchPromo }}</v-card-text>
      </v-flex>
      <v-flex xs3>
        <v-card-text class="text-xs-center">{{ viewPromo }}</v-card-text>
      </v-flex>
      <v-flex xs3>
        <v-card-text class="text-xs-center">{{ comparePromo }}</v-card-text>
      </v-flex>
      <v-flex xs3>
        <v-card-text class="text-xs-center">{{ mdaPromo }}</v-card-text>
      </v-flex>
    </v-layout>
    <v-layout row justify-space-around class="mt-5">
      <iframe width="871" height="490" src="https://www.youtube.com/embed/3jcXXx1uQU4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        searchPromo: 'Know which entity has been completed? Which has not?',
        viewPromo: 'See overall completeness of a class of entities',
        comparePromo: 'Compare completeness between different facets of a class',
        mdaPromo: 'Multidimensional completeness analysis',
      }
    }
  }
</script>
