import vaccinesRepositories from "../repositories/vaccines.repositore.js";
import authService from "../services/auth.service.js";

  async function getVaccinesService() {
      const vaccines = await vaccinesRepositories.getVaccinesRepository();
    
      if (vaccines.length === 0) throw new Error("Não há nenhuma vacina cadastrada");
    
      return vaccines;
    }

  async function postVaccinesService({
    name,
    date,
    description,
    photo,
  }){
    if (!name || !date)
    throw new Error("Envie todos os campos obrigatórios para cadastrar");

    const vaccines = await vaccinesRepositories.postVaccinesRepository({
        name,
        date,
        description,
        photo,
      });
    
      if (!vaccines) throw new Error("Erro ao cadastrar os dados da vacina, tente novamente");
    
      const token = authService.generateToken(vaccines.id);
      
      return token;
  }

  async function updateVaccinesService(
    { name, date, description, photo },
    vaccineId,
  ) {
    if (!name && !date && !description && !photo)
      throw new Error("Envie ao menos um campo para atualizar os dados da vacina");
  
    // const vaccines = await vaccinesRepositories.findByIdVaccinesRepository(vaccineId);
  
    await vaccinesRepositories.updateVaccinesRepository(
      vaccineId,
      name,
      date,
      description,
      photo,
    );
  
    return { message: "Vacina atualizada com sucesso!" };
  }

  async function findVaccinesByIdService(id) {
    const vaccines = await vaccinesRepositories.findByIdVaccinesRepository(id);
  
    if (!vaccines) throw new Error("Vacina não encontrada");
  
    return {
      vaccineId: vaccines._id,
      name: vaccines.name,
      date: vaccines.date,
      description: vaccines.description,
      photo: vaccines.photo,
    };
  }

  async function deleteVaccinesService(id){
    const vaccines = await findVaccinesByIdService(id);

    if (!vaccines) throw new Error("Vacina não encontrada");
  
    await vaccinesRepositories.deleteVaccinesRepository(id);
  }

  export default {
    getVaccinesService,
    postVaccinesService,
    updateVaccinesService,
    findVaccinesByIdService,
    deleteVaccinesService
  }