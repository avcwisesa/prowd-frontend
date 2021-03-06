<template>
  <v-container fluid>
      <v-card-title class="headline">Background</v-card-title>
      <v-card-text align='left'>
        Due to weak enforcement of constraints, assessing the completeness of entities in open-domain knowledge bases such as Wikidata is a challenging task. To address the problem, we are building a tool, called ProWD, for profiling the completeness of entities in Wikidata that allows users to analyze the completeness of information of entities of interest. It is based on class-facet-attribute (CFA) profiles, a concept which allows to define, for a given class of interest, a set of attributes that should be analyzed, and a set of facets to structure the entities. ProWD is suited for people interested in seeing or comparing data completeness of a CFA profile.
        <br><br>
        ProWD now features multi-dimensional analytics (MDA) of completeness. The feature visualizes the completeness of attributes over different facet combinations of a class, so that users can gain insights as to which completeness gaps exist in that class.
        <br><br>
        ProWD users can tackle the following questions using ProWD-MDA:<br>
        <ul>
          <li>
            Over a single facet combination
            <ul>
              <li>
                How is the overall view of the completeness of attributes of interest for that single facet? Is the facet generally complete, or generally incomplete?
              </li>
              <li>
                Which attribute is the most complete, and which is the least complete with respect to the facet? How wide is the gap between the most complete attribute vs. the least complete attribute?
              </li>
            </ul>
          </li>
          <li>
            Over multiple facet combinations:
            <ul>
              <li>
                How is the overall completeness picture of the class of interest by looking at (a sample of) the completeness state of the facet combinations of the class? Which attributes are generally complete, and which are generally incomplete for that class?
              </li>
              <li>
                How is the amount of entities distributed according to different facet values? Is there any amount gap between different facets?
                </li>
              <li>
                How does the attribute completeness state of a facet combination compare to others? Which facet combination is the most complete, and the least complete?
              </li>
              <li>
                Does a facet combination have an anomaly (that is, complete for attributes that are incomplete in other facet combinations; or incomplete for attributes that are complete in other facet combinations).
              </li>
            </ul>
          </li>
        </ul>
        <br>
        Source code for ProWD can be accessed <a target="_blank" href="https://github.com/avcwisesa/prowd-frontend">here for the front-end service</a>, and <a target="_blank" href="https://github.com/avcwisesa/wikidata-profiling-prototype-back">here for the back-end service</a>.
        <br>
        ProWD thesis: <a target="_blank" href="https://drive.google.com/file/d/1-ufB4-mF_CpuSO6aLXjMJRFHUcWrT307/view">"Knowledge Graph Completeness Analytics: Cace Study of Wikidata"</a>

      </v-card-text>
      <v-card-title class="headline">Credits</v-card-title>
      <v-card-text align='left'>
        Supported by the TaDaQua project, funded by <a href="https://www.unibz.it">the Free University of Bolzano</a>, Italy
      </v-card-text>
      <v-card-text align='left'>
        <span class="font-weight-medium">Image credits:</span>
        Photo by <a href=https://www.pexels.com/@jtmultimidia-164235>JTMultimidia from Pexels</a>
        <br>
        <span class="font-weight-medium">Icons Credit:</span>
          <ul>
            <li>
              <a href=https://thenounproject.com>Noun Project</a>
            </li>
            <li>
              <a href=https://www.iconfinder.com>Iconfinder</a>
            </li>
          </ul>
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
