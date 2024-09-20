import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { uploadFile } from 'src/helpers/uploadFile'; // Assuming a helper class for file uploads

@Injectable()
export class DestinationService {
  constructor(private readonly prisma: PrismaService) { }

  async createDestination(data: any, files: any): Promise<any> {
    const { name, description, directory, typeDocumentsIds } = data;

    // Check if the destination exists
    const destinationExists = await this.prisma.destination.findFirst({
      where: { name },
    });

    let paths = []
    if (destinationExists) return null

    // Upload file and get its path
    if (Array.isArray(files.images)) {
      paths = await Promise.all(files.images.map(async (imageFile, index) => {
        try {
          imageFile.name = `${index + 1}.${imageFile.mimetype.split('/')[1]}`;
          const new_image = await uploadFile(`destinations/${directory}`, imageFile, "image");
          if (new_image !== "error") {
            return new_image;
          }
        } catch (error) {
          throw new BadRequestException(error.message, "Failed to upload image");
        }
      }));
    }
    else {
      try {
        files.images.name = `1.${files.images.mimetype.split('/')[1]}`;
        const new_image = await uploadFile(`destinations/${directory}`, files.images, "image");
        if (new_image !== "error") {
          paths.push(new_image)
        }
      } catch (error) {
        throw new BadRequestException(error.message, "Failed to upload image");
      }
    }

    // Create new destination
    const newDestination = await this.prisma.destination.create({
      data: {
        name,
        description,
        directory,
        pictures: paths, // You can adapt this if there are multiple files
        requirements: {
          connect: typeDocumentsIds.map((id) => ({ id })),
        },
      },
    });

    // Update type documents to link them with the new destination
    await this.prisma.typeDocument.updateMany({
      where: { id: { in: typeDocumentsIds } },
      data: {
        destinations: {
          connect: { id: newDestination.id },
        },
      },
    });

    return newDestination;
  }

  async getDestinationById(id: number): Promise<any> {
    try {
      return await this.prisma.destination.findUnique({
        where: { id },
        include: { requirements: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllDestinations(page: number, keywords?: string): Promise<any> {
    try {
      const pageSize = 9;
      const skip = (page - 1) * pageSize;

      const where = keywords
        ? {
          removed: false,
          OR: [
            { name: { contains: keywords, mode: 'insensitive' } },
            { description: { contains: keywords, mode: 'insensitive' } },
          ],
        }
        : { removed: false };

      return await this.prisma.destination.findMany({
        where,
        skip,
        take: pageSize,
        include: { requirements: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateDestination(id: number, data: any, files: any): Promise<any> {
    try {
      const existingDestination = await this.prisma.destination.findUnique({ where: { id } });

      if (!existingDestination) {
        throw new BadRequestException("Destination doesn't exist");
      }

      // Handle image removal and uploading new images
      if (data.removedImages) {
        await this.fileHelper.deleteImages(data.removedImages);
      }

      let newPictures = [];
      if (files?.images) {
        const newImages = await this.fileHelper.uploadImages(files.images, `public/destinations/${existingDestination.directory}`);
        newPictures = [...existingDestination.pictures, ...newImages];
      }

      const updatedDestination = await this.prisma.destination.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          requirements: { connect: data.typeDocumentsIds.map((id: number) => ({ id })) },
          pictures: newPictures,
        },
      });

      return updatedDestination;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeDestination(id: number): Promise<any> {
    try {
      const destination = await this.prisma.destination.findUnique({ where: { id } });
      if (destination?.pictures) {
        await this.fileHelper.deleteImages(destination.pictures);
      }

      await this.prisma.typeDocument.updateMany({
        where: { destinations: { some: { id } } },
        data: { destinations: { disconnect: { id } } },
      });

      return await this.prisma.destination.update({
        where: { id },
        data: { removed: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
function uploadImage(arg0: string, images: any, arg2: string) {
  throw new Error('Function not implemented.');
}

