[![Build Status](https://travis-ci.org/bahaaldine/topology.svg?branch=master)](https://travis-ci.org/bahaaldine/topology)

# Topology

![alt Topology](https://github.com/bahaaldine/topology/blob/master/example.gif?raw=true)

## Installation

### Create Catsize user & role

Catsize needs to create and manage its own index *catsize*, therefore needs a dedicated user with the relative permissions.
With the Native Realm (X-Pack Security API) create the following role:

```json
PUT /_xpack/security/role/catsize_role
{
  "cluster": [
    "manage_index_templates"
  ],
  "indices": [
    {
      "names": [
        "catsize*"
      ],
      "privileges": [
        "all"
      ]
    }
  ]
}
```
And then create a user mapped to the role:

```json
POST /_xpack/security/user/catsize
{
  "password" : "catsize", 
  "roles" : [ "catsize_role" ], 
  "full_name" : "Cat Size", 
  "email" : "catsize@elastic.co", 
  "enabled": true 
}
```
Please note that you can choose whatever username and password you want.

### Add Topology configuration to Kibana.yml

With the user and role created, add the following topology settings to the kibana.yml file:

*Minimal configuration*
```yaml
topology:
  elasticsearch:
    username: topology
    password: topology
```

*Full-version*
```yaml
topology:
  elasticsearch:
    url: url_to_the_elasticsearch_cluser
    ssl: 
      cert: path_to_the_cert_file
      key: path_to_the_key_file
      ca: path_to_the_ca_file
      verify: boolean, whether or not the certificate should be verified
    username: topology
    password: topology
```

### Installing plugin

Topology does not support Kibana version lower than 5.x. The topology version you will use, should be the same than the Kibana version, you just need to adapt the following command:

```sh
#Kibana >= 5.x

./bin/kibana-plugin install https://github.com/bahaaldine/topology/releases/download/major.minor.patch/topology-major.minor.patch.zip

```

## Supported Kibana versions

This plugin is supported by:

* Kibana 5

## Features:

* Explore indices / shards / segments topology
