[![Build Status](https://travis-ci.org/bahaaldine/topology.svg?branch=master)](https://travis-ci.org/bahaaldine/topology)

# Topology

![alt Topology](https://github.com/bahaaldine/topology/blob/master/example.gif?raw=true)

## Installation

If you don't have X-Pack security installed, you can jump to the plugin installation directly [here](https://github.com/bahaaldine/topology/blob/master/README.md#installing-plugin)

### Create Topology user & role

Topology uses the `_cat` API therefore needs monitor priviledge at cluster level.
With the Native Realm (X-Pack Security API) create the following role:

```json
PUT /_xpack/security/role/topology_role
{
  "cluster": [
    "monitor"
  ]
}
```
And then create a user mapped to the role:

```json
POST /_xpack/security/user/topology
{
  "password" : "topology", 
  "roles" : [ "topology_role" ], 
  "full_name" : "Topo logy", 
  "email" : "topology@elastic.co", 
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
