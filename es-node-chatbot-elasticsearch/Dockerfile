#FROM elasticsearch:2.4.6
FROM elasticsearch:5.6.5

COPY ./config.yml /usr/share/elasticsearch/config/elasticsearch.yml

#elasticsearch-analysis-morphology
#RUN bin/plugin install http://dl.bintray.com/content/imotov/elasticsearch-plugins/org/elasticsearch/elasticsearch-analysis-morphology/2.4.6/elasticsearch-analysis-morphology-2.4.6.zip
RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install http://dl.bintray.com/content/imotov/elasticsearch-plugins/org/elasticsearch/elasticsearch-analysis-morphology/5.6.5/elasticsearch-analysis-morphology-5.6.5.zip
