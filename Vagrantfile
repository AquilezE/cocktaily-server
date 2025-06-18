# -*- mode: ruby -*-
# vi: set ft=ruby :


Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/jammy64"  


  config.vm.define "mysql" do |mysql|
    mysql.vm.hostname = "mysqlStream"
    mysql.vm.network "public_network", ip: "33.43.1.15"
    mysql.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "provision-mysql.yml"
    end
  end

  config.vm.define "nginxRMTP" do |nginxRMTP|
    nginxRMTP.vm.hostname = "static"
    nginxRMTP.vm.network "public_network", ip: "33.43.1.13"
    nginxRMTP.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "provision-nginxRMTP.yml"
    end
  end

  config.vm.define "api" do |api|
    api.vm.hostname = "apiStream"
    api.vm.network "public_network", ip: "33.43.1.14"
    api.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "provision-api.yml"
    end
  end


  
end
