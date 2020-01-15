#!/usr/bin/env bash
#curl -X PUT --header "Content-Type: application/json" --header "Accept: application/json" -d " { _id: "5c77d15f2b8aee79b8141904", title: "my title", creator: "Silvia Peter", affiliation: "ESS", abstract: "my abstract", authors: [ "Silvia Peter" ], dataDescription: "my long description", pidArray: [ "20.500.11935/3bc9468e-07a5-4d50-b560-ea2e45ff85ed", "20.500.11935/70a1b192-61f9-4dff-9510-9f861167a82b", "20.500.11935/9d133088-30d6-47d4-9e73-d02cd4812c6a" ], publisher: "ESS", resourceType: "NeXus HDF5 Files", publicationYear: null, url: "", thumbnail: "", numberOfFiles: null, sizeOfArchive: null }" "http://localhost:3000/sample/publications"
curl -X PUT --header "Content-Type: application/json" --header "Accept: application/json" -d '{ 
   "doi": "8273918/fhueirhfaesiu", 
   "affiliation": "ESS",  
   "creator": "James Chadwick",  
   "publisher": "ESS",  
   "publicationYear": 2018,  
   "title": "Neutron experiments at the beamline x",  
   "url": "string",  
   "abstract": "string",  
   "dataDescription": "description of all data available",  
   "thumbnail": "string",  
   "resourceType": "string",  
   "numberOfFiles": 0,  
   "sizeOfArchive": 0,  
   "pidArray": [  
     "string"  
   ],  
   "authors": [  
     "string"  
   ],  
   "doiRegisteredSuccessfullyTime": "2019-03-19T09:48:44.129Z" 
 }' "http://localhost:3000/scicat/Publication"
