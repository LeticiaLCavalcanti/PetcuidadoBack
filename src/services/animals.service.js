import animalsRepositories from "../repositories/animals.repositore.js";
import authService from "../services/auth.service.js";

  async function getAnimalsService() {
      const animals = await animalsRepositories.getAnimalsRepository();
    
      if (animals.length === 0) throw new Error("Não há nenhum animal cadastrado");
    
      return animals;
    }

  async function postAnimalsService({
    name,
    birth,
    breed,
    sex,
    color,
    weight,
    chipNumber,
    photo,
  }){
    if (!name || !birth || !breed)
    throw new Error("Envie todos os campos obrigatórios para cadastrar");

    const animals = await animalsRepositories.postAnimalsRepository({
        name,
        birth,
        breed,
        color,
        weight,
        chipNumber,
        photo,
      });
    
      if (!animals) throw new Error("Erro ao cadastrar o animal, tente novamente");
    
      const token = authService.generateToken(animals.id);
      
      return token;
  }

  async function updateAnimalsService(
    { name, birth, breed, sex, color, weight, chipNumber, photo },
    animalId,
  ) {
    if (!name && !birth && !breed && !sex && !color && !weight && !chipNumber && !photo)
      throw new Error("Envie ao menos um campo para atualizar usuário");
  
    const animals = await animalsRepositories.findByIdAnimalsRepository(animalId);
  
    await animalsRepositories.updateAnimalsRepository(
      animalId,
      name,
      birth,
      breed,
      sex,
      color,
      weight,
      chipNumber,
      photo 
    );
  
    return { message: "Animal atualizado com sucesso!" };
  }

  async function findAnimalsByIdService(id) {
    const animals = await animalsRepositories.findByIdAnimalsRepository(id);
  
    if (!animals) throw new Error("Animal não encontrado");
  
    return {
      animalId: animals._id,
      name: animals.name,
      birth: animals.birth,
      breed: animals.breed,
      sex: animals.sex,
      color: animals.color,
      weight: animals.weight,
      chipNumber: animals.chipNumber,
      photo: animals.photo,
    };
  }

  async function deleteAnimalsService(id){
    const animal = await findAnimalsByIdService(id);

    if (!animal) throw new Error("Animal não encontrado");
  
    await animalsRepositories.deleteAnimalsRepository(id);
  }

  export default {
    getAnimalsService,
    postAnimalsService,
    updateAnimalsService,
    findAnimalsByIdService,
    deleteAnimalsService
  }