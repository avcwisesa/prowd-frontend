<template>
  <v-container>
      <v-card-title class="headline">Background</v-card-title>
      <v-card-text align='left'>
        Due to weak enforcement of constraints, assessing the completeness of entities in open-domain knowledge bases such as Wikidata is a challenging task. To address the problem, we are building a tool, called ProWD, for profiling the completeness of entities in Wikidata that allows users to analyze the completeness of information of entities of interest. It is based on class-facet-attribute (CFA) profiles, a concept which allows to define, for a given class of interest, a set of attributes that should be analyzed, and a set of facets to structure the entities. ProWD is suited for people interested in seeing or comparing data completeness of a CFA profile.

ProWD now features multi-dimensional analytics (MDA) of completeness. The feature visualizes the completeness of attributes over different facet combinations of a class, so that users can gain insights as to which completeness gaps exist in that class.

ProWD users can tackle the following questions using ProWD-MDA:
- Over a single facet combination
	> How is the overall view of the completeness of attributes of interest?
	> Which attribute is the most complete, and which is the least complete?

- Over multiple facet combinations:
	> How is the overall completeness state of a facet combination compared to others?
	> Does a facet combination have an (in-)completeness anomaly (that is, complete for attributes that are incomplete in other facet combinations; or incomplete for attributes that are complete in other facet combinations)?


      </v-card-text>
      <v-card-title class="headline">Credits</v-card-title>
      <v-card-text>
        Supported by the TaDaQua project, funded by <a href="https://www.unibz.it">the Free University of Bolzano</a>, Italy
      </v-card-text>
      <v-card-text>Image credits: Photo by JTMultimidia from Pexels<br>
        <div>Icons Credit:<br>
https://thenounproject.com/term/cube/2076180/<br>
https://thenounproject.com/term/scales/151852/<br>
https://www.iconfinder.com/icons/3005765/analysis_bar_chart_graph_icon<br>
https://www.iconfinder.com/icons/322497/search_icon<br>
<!-- Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>-->
</div>
      </v-card-text>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        gradient: 'to top right, rgba(5,5,5, .7), rgba(0,0,0, .7)',
        prowdPromo: 'Class-Facet-Attribute Profiling system for Wikidata',
        searchPromo: 'Know which entity has been completed? Which has not?',
        viewPromo: 'See overall completeness of a class of entities',
        comparePromo: 'Compare completeness between a class of entities'
      }
    }
  }
</script>
